#!/usr/bin/env node
/**
 * Customer deduplication · merges same-address customers created during the
 * two-pass import (invoice-derived + customer-list-derived).
 *
 * For each group of customers with the same normalized street address:
 *   1. Pick a keeper. Preference: has ServiceTitan ID, has phone, has email,
 *      has lifetime_jobs > 0, oldest id (tiebreaker).
 *   2. Merge missing fields from the duplicates into the keeper (so phone or
 *      email from one row carries over if the keeper was missing them).
 *   3. Re-link all invoice_history rows from duplicates to the keeper.
 *   4. Delete the duplicate customer records.
 *
 * Idempotent. Safe to re-run.
 *
 * Default mode is DRY-RUN. Pass --apply to actually perform the merge:
 *   node scripts/dedupe-customers.mjs              # report only
 *   node scripts/dedupe-customers.mjs --apply      # actually merge
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: resolve(__dirname, "..", ".env.local") });

const APPLY = process.argv.includes("--apply");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

const normalize = (s) =>
  (s ?? "").toString().trim().replace(/\s+/g, " ").toLowerCase();

// Pick keeper from a group: prefer (has ST ID, has phone, has email, has jobs, oldest id)
function pickKeeper(group) {
  const scored = group.map((c) => ({
    c,
    score:
      (c.servicetitan_customer_id ? 1000 : 0) +
      (c.phone_e164 ? 100 : 0) +
      (c.email ? 10 : 0) +
      ((c.lifetime_jobs ?? 0) > 0 ? 5 : 0),
  }));
  scored.sort((a, b) => b.score - a.score || a.c.id - b.c.id);
  return { keeper: scored[0].c, dupes: scored.slice(1).map((s) => s.c) };
}

async function fetchAllCustomers() {
  const out = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("customers")
      .select(
        "id, name, phone_e164, email, street_address, city, state, zip, servicetitan_customer_id, customer_type, lifetime_revenue_cents, lifetime_jobs, last_job_completed_at, notes"
      )
      .range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

console.log(`\n╭────────────────────────────────────────────────────────╮`);
console.log(`│  Customer Deduplication ${APPLY ? "·  APPLY MODE" : "·  DRY RUN"}                  │`);
console.log(`╰────────────────────────────────────────────────────────╯\n`);

const customers = await fetchAllCustomers();
console.log(`Loaded ${customers.length} customers.\n`);

// Group by normalized (name + street_address). Skip customers without an address.
const groups = new Map();
for (const c of customers) {
  if (!c.street_address) continue;
  const key = `${normalize(c.name)}|||${normalize(c.street_address)}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(c);
}

const dupGroups = [...groups.entries()].filter(([_, rows]) => rows.length > 1);
console.log(`Found ${dupGroups.length} duplicate groups.`);
console.log(`Total duplicate rows that would be removed: ${dupGroups.reduce((s, [_, rows]) => s + rows.length - 1, 0)}\n`);

let merged = 0;
let invoicesRelinked = 0;
let customersDeleted = 0;
let errors = 0;

for (const [_, group] of dupGroups) {
  const { keeper, dupes } = pickKeeper(group);

  // Build merge payload — fill in fields the keeper is missing
  const update = {};
  for (const d of dupes) {
    if (!keeper.servicetitan_customer_id && d.servicetitan_customer_id)
      update.servicetitan_customer_id = d.servicetitan_customer_id;
    if (!keeper.phone_e164 && d.phone_e164) update.phone_e164 = d.phone_e164;
    if (!keeper.email && d.email) update.email = d.email;
    if (!keeper.zip && d.zip) update.zip = d.zip;
    if (!keeper.customer_type && d.customer_type) update.customer_type = d.customer_type;
    if (
      (!keeper.lifetime_revenue_cents || keeper.lifetime_revenue_cents === 0) &&
      d.lifetime_revenue_cents
    )
      update.lifetime_revenue_cents = d.lifetime_revenue_cents;
    if ((!keeper.lifetime_jobs || keeper.lifetime_jobs === 0) && d.lifetime_jobs)
      update.lifetime_jobs = d.lifetime_jobs;
    if (!keeper.last_job_completed_at && d.last_job_completed_at)
      update.last_job_completed_at = d.last_job_completed_at;
  }

  if (merged < 5 && !APPLY) {
    console.log(`  Sample group:`);
    console.log(`    Keeper:  id=${keeper.id} "${keeper.name}" @ ${keeper.street_address}`);
    for (const d of dupes) {
      console.log(`    Dupe:    id=${d.id} "${d.name}" @ ${d.street_address}`);
    }
    console.log(`    Merge fields onto keeper: ${Object.keys(update).join(", ") || "(none)"}`);
    console.log(``);
  }

  if (!APPLY) {
    merged++;
    continue;
  }

  // 1. Update keeper with merged fields if any
  if (Object.keys(update).length > 0) {
    const { error: upErr } = await supabase.from("customers").update(update).eq("id", keeper.id);
    if (upErr) {
      console.error(`  ✗ Update keeper ${keeper.id}: ${upErr.message}`);
      errors++;
      continue;
    }
  }

  // 2. Re-link invoice_history from dupes to keeper
  const dupeIds = dupes.map((d) => d.id);
  const { data: relinked, error: relinkErr } = await supabase
    .from("invoice_history")
    .update({ customer_id: keeper.id })
    .in("customer_id", dupeIds)
    .select("id");
  if (relinkErr) {
    console.error(`  ✗ Relink invoices for keeper ${keeper.id}: ${relinkErr.message}`);
    errors++;
    continue;
  }
  invoicesRelinked += relinked.length;

  // 3. Delete the duplicates
  const { error: delErr } = await supabase.from("customers").delete().in("id", dupeIds);
  if (delErr) {
    console.error(`  ✗ Delete dupes for keeper ${keeper.id}: ${delErr.message}`);
    errors++;
    continue;
  }
  customersDeleted += dupes.length;
  merged++;

  if (merged % 25 === 0) process.stdout.write(`  ↳ ${merged}/${dupGroups.length} groups processed\r`);
}

console.log(`\n────────────────────────────────────────────────────────`);
console.log(APPLY ? `✅ Deduplication complete.` : `📋 Dry run complete. Re-run with --apply to actually merge.`);
console.log(`────────────────────────────────────────────────────────`);
console.log(`   Groups processed:        ${merged}`);
console.log(`   Customers deleted:       ${customersDeleted}`);
console.log(`   Invoices re-linked:      ${invoicesRelinked}`);
console.log(`   Errors:                  ${errors}`);
console.log(`────────────────────────────────────────────────────────\n`);

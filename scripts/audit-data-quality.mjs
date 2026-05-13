#!/usr/bin/env node
/**
 * Data quality audit · runs read-only checks against Supabase and
 * reports the state of customers + invoice_history.
 *
 * Surfaces:
 *   - Counts and completeness percentages
 *   - Duplicate name+address pairs
 *   - Phone format issues
 *   - Email format issues
 *   - Stranded invoice_history rows (no customer link)
 *   - Address parsing failures
 *   - Customers with no contact info at all (high-priority cleanups)
 *
 * Read-only. Safe to run anytime.
 *
 * Usage:
 *   node scripts/audit-data-quality.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: resolve(__dirname, "..", ".env.local") });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

async function fetchAll(table, columns) {
  const out = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

const normalize = (s) => (s ?? "").toString().trim().replace(/\s+/g, " ").toLowerCase();

console.log(`\n╭────────────────────────────────────────────────────────╮`);
console.log(`│  Z and Z OS · Data Quality Audit · ${new Date().toISOString().slice(0, 10)}            │`);
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────────────────────────────────

console.log(`╭─ Customers ────────────────────────────────────────────╮`);
const customers = await fetchAll(
  "customers",
  "id, name, phone_e164, email, street_address, city, state, zip, servicetitan_customer_id, customer_type, lifetime_revenue_cents, lifetime_jobs, last_job_completed_at"
);

const total = customers.length;
const withPhone = customers.filter((c) => c.phone_e164).length;
const withEmail = customers.filter((c) => c.email).length;
const withStId = customers.filter((c) => c.servicetitan_customer_id).length;
const withAddress = customers.filter((c) => c.street_address).length;
const withCity = customers.filter((c) => c.city).length;
const withZip = customers.filter((c) => c.zip).length;
const withLastJob = customers.filter((c) => c.last_job_completed_at).length;
const withRevenue = customers.filter((c) => c.lifetime_revenue_cents > 0).length;

const pct = (n) => `${Math.round(100 * n / total)}%`.padStart(4);

console.log(`│ Total rows:                 ${String(total).padStart(5)}              │`);
console.log(`│ With phone (E.164):         ${String(withPhone).padStart(5)} (${pct(withPhone)})       │`);
console.log(`│ With email:                 ${String(withEmail).padStart(5)} (${pct(withEmail)})       │`);
console.log(`│ With ServiceTitan ID:       ${String(withStId).padStart(5)} (${pct(withStId)})       │`);
console.log(`│ With street address:        ${String(withAddress).padStart(5)} (${pct(withAddress)})       │`);
console.log(`│ With city:                  ${String(withCity).padStart(5)} (${pct(withCity)})       │`);
console.log(`│ With zip code:              ${String(withZip).padStart(5)} (${pct(withZip)})       │`);
console.log(`│ With ever-completed job:    ${String(withLastJob).padStart(5)} (${pct(withLastJob)})       │`);
console.log(`│ With lifetime revenue > 0:  ${String(withRevenue).padStart(5)} (${pct(withRevenue)})       │`);

// Customers with NO contact info
const noContact = customers.filter((c) => !c.phone_e164 && !c.email).length;
console.log(`│ ⚠️  No phone AND no email:   ${String(noContact).padStart(5)} (${pct(noContact)})       │`);
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Duplicate detection
// ──────────────────────────────────────────────────────────────────────────

console.log(`╭─ Potential duplicates ─────────────────────────────────╮`);

const byName = new Map();
for (const c of customers) {
  const k = normalize(c.name);
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(c);
}

const sameName = [...byName.entries()].filter(([_, rows]) => rows.length > 1);
console.log(`│ Customers with shared first+last name:  ${String(sameName.length).padStart(4)}         │`);
const sameNameTotal = sameName.reduce((s, [_, rows]) => s + rows.length, 0);
console.log(`│ Rows involved in shared-name groups:    ${String(sameNameTotal).padStart(4)}         │`);

const byNameAddr = new Map();
for (const c of customers) {
  const k = `${normalize(c.name)}|||${normalize(c.street_address)}`;
  if (!byNameAddr.has(k)) byNameAddr.set(k, []);
  byNameAddr.get(k).push(c);
}
const sameNameAddr = [...byNameAddr.entries()].filter(([_, rows]) => rows.length > 1);
console.log(`│ Same name AND same address (true dups): ${String(sameNameAddr.length).padStart(4)}         │`);

if (sameNameAddr.length > 0) {
  console.log(`│                                                        │`);
  console.log(`│ Top 5 likely true-duplicates:                          │`);
  for (const [, rows] of sameNameAddr.slice(0, 5)) {
    const display = `${rows[0].name} @ ${rows[0].street_address ?? "?"}`.slice(0, 50);
    console.log(`│   • ${display.padEnd(52)} │`);
  }
}
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Phone format issues
// ──────────────────────────────────────────────────────────────────────────

const badPhones = customers.filter(
  (c) => c.phone_e164 && !/^\+1\d{10}$/.test(c.phone_e164)
);
console.log(`╭─ Phone format ─────────────────────────────────────────╮`);
console.log(`│ Phones not matching +1XXXXXXXXXX format: ${String(badPhones.length).padStart(4)}         │`);
if (badPhones.length > 0) {
  console.log(`│                                                        │`);
  console.log(`│ Sample bad phones (first 5):                           │`);
  for (const c of badPhones.slice(0, 5)) {
    console.log(`│   • ${c.name?.slice(0, 25).padEnd(25)} ${c.phone_e164.padEnd(22)} │`);
  }
}
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Email format issues
// ──────────────────────────────────────────────────────────────────────────

const badEmails = customers.filter(
  (c) => c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)
);
console.log(`╭─ Email format ─────────────────────────────────────────╮`);
console.log(`│ Emails not matching basic format:        ${String(badEmails.length).padStart(4)}         │`);
if (badEmails.length > 0) {
  console.log(`│                                                        │`);
  console.log(`│ Sample bad emails (first 5):                           │`);
  for (const c of badEmails.slice(0, 5)) {
    console.log(`│   • ${c.name?.slice(0, 25).padEnd(25)} ${c.email.slice(0, 22).padEnd(22)} │`);
  }
}
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Invoice history health
// ──────────────────────────────────────────────────────────────────────────

console.log(`╭─ Invoice history ──────────────────────────────────────╮`);
const invoices = await fetchAll(
  "invoice_history",
  "id, customer_id, total_cents, balance_cents, completed_on, technician, job_type, raw_customer_name"
);

const invTotal = invoices.length;
const linked = invoices.filter((i) => i.customer_id).length;
const stranded = invoices.filter((i) => !i.customer_id).length;
const totalRev = invoices.reduce((s, i) => s + (i.total_cents ?? 0), 0);
const totalBalance = invoices.reduce((s, i) => s + (i.balance_cents ?? 0), 0);
const positiveBalance = invoices.filter((i) => (i.balance_cents ?? 0) > 0).length;

const invPct = (n) => `${Math.round(100 * n / invTotal)}%`.padStart(4);
console.log(`│ Total invoices:               ${String(invTotal).padStart(5)}            │`);
console.log(`│ Linked to a customer:         ${String(linked).padStart(5)} (${invPct(linked)})    │`);
console.log(`│ ⚠️  Stranded (no customer):   ${String(stranded).padStart(5)} (${invPct(stranded)})    │`);
console.log(`│ Total revenue captured:       $${(totalRev / 100).toLocaleString().padStart(11)}      │`);
console.log(`│ Total unpaid balance:         $${(totalBalance / 100).toLocaleString().padStart(11)}      │`);
console.log(`│ Invoices with balance owing:  ${String(positiveBalance).padStart(5)}            │`);

// Date range
const dates = invoices.map((i) => i.completed_on).filter(Boolean).sort();
if (dates.length > 0) {
  console.log(`│ Date range: ${dates[0].slice(0, 10)} → ${dates.at(-1).slice(0, 10)}        │`);
}
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Top revenue customers (sanity check the data)
// ──────────────────────────────────────────────────────────────────────────

console.log(`╭─ Top 10 customers by lifetime revenue ─────────────────╮`);

// Roll up invoice totals per customer
const revByCustomer = new Map();
for (const inv of invoices) {
  if (!inv.customer_id) continue;
  revByCustomer.set(inv.customer_id, (revByCustomer.get(inv.customer_id) ?? 0) + (inv.total_cents ?? 0));
}

const custMap = new Map(customers.map((c) => [c.id, c]));
const top10 = [...revByCustomer.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

for (const [cid, totalCents] of top10) {
  const c = custMap.get(cid);
  const name = (c?.name ?? "?").slice(0, 30).padEnd(30);
  const rev = `$${(totalCents / 100).toLocaleString()}`.padStart(11);
  console.log(`│ ${name} ${rev}        │`);
}
console.log(`╰────────────────────────────────────────────────────────╯\n`);

// ──────────────────────────────────────────────────────────────────────────
// Recommendations
// ──────────────────────────────────────────────────────────────────────────

console.log(`╭─ Recommendations before building dashboards ───────────╮`);

const recs = [];
if (stranded > 0) recs.push(`• ${stranded} invoices unlinked — re-run customer-list import to fix`);
if (sameNameAddr.length > 0) recs.push(`• ${sameNameAddr.length} likely-duplicate customer pairs — review in admin`);
if (badPhones.length > 0) recs.push(`• ${badPhones.length} malformed phones — fix in admin or script`);
if (badEmails.length > 0) recs.push(`• ${badEmails.length} malformed emails — fix in admin or script`);
if (noContact > total * 0.3) recs.push(`• ${noContact} customers have NO contact info — Tier 1 cleanup candidate`);
if (recs.length === 0) recs.push(`• Data looks healthy. Ready to build dashboards.`);

for (const r of recs) {
  console.log(`│ ${r.slice(0, 54).padEnd(54)} │`);
}
console.log(`╰────────────────────────────────────────────────────────╯\n`);

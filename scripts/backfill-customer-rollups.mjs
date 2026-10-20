#!/usr/bin/env node
/**
 * Backfill customer lifetime stats from the ServiceTitan archive.
 *
 * Migration 007 moved every imported invoice into invoice_history_archive, but
 * customers.lifetime_revenue_cents / lifetime_jobs were never filled from it,
 * so Top spenders, the repeat-customer rate, and the dormant list all read
 * zero. This sets, per customer with archived work:
 *   lifetime_revenue_cents = archived billed total + paid OS invoices
 *   lifetime_jobs          = archived invoices with a positive total + paid OS jobs
 *   last_job_completed_at  = the later of the stored value and the newest archived date
 *
 *   node scripts/backfill-customer-rollups.mjs           # dry run: counts only
 *   node scripts/backfill-customer-rollups.mjs --apply   # writes
 *
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local. Safe to
 * re-run: it recomputes from source rows rather than adding to stored values.
 */

import fs from "node:fs";

const apply = process.argv.includes("--apply");
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const base = `${env.SUPABASE_URL}/rest/v1`;
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` };

async function all(table, select) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    // A stable order is required for paging: without it Postgres may repeat or
    // skip rows between pages, and --apply would write wrong totals.
    const r = await fetch(`${base}/${table}?select=${select}&order=id.asc`, { headers: { ...headers, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
    const rows = await r.json(); out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

const archive = await all("invoice_history_archive", "id,customer_id,total_cents,invoiced_on,completed_on");
const paid = await all("invoices", "id,customer_id,job_id,amount_cents,paid_at");
const customers = await all("customers", "id,lifetime_revenue_cents,lifetime_jobs,last_job_completed_at");

const roll = new Map();
const get = (id) => roll.get(id) ?? (roll.set(id, { cents: 0, jobs: 0, last: null, osJobs: new Set() }), roll.get(id));
for (const a of archive) {
  if (!a.customer_id) continue;
  const r = get(a.customer_id);
  const cents = Number(a.total_cents ?? 0);
  r.cents += cents;
  if (cents > 0) r.jobs += 1;
  const d = a.completed_on ?? a.invoiced_on;
  if (d && (!r.last || d > r.last)) r.last = d;
}
for (const p of paid) {
  if (!p.customer_id || !p.paid_at) continue;
  const r = get(p.customer_id);
  r.cents += Number(p.amount_cents ?? 0);
  if (p.job_id) r.osJobs.add(p.job_id); else r.jobs += 1;
}

const updates = [];
for (const c of customers) {
  const r = roll.get(c.id);
  if (!r) continue;
  const jobs = r.jobs + r.osJobs.size;
  const lastStored = c.last_job_completed_at ? c.last_job_completed_at.slice(0, 10) : null;
  const last = [lastStored, r.last].filter(Boolean).sort().pop() ?? null;
  if (c.lifetime_revenue_cents === r.cents && c.lifetime_jobs === jobs && lastStored === last) continue;
  updates.push({ id: c.id, lifetime_revenue_cents: r.cents, lifetime_jobs: jobs, last_job_completed_at: last });
}

const spent1k = updates.filter((u) => u.lifetime_revenue_cents >= 100000).length;
const repeat = updates.filter((u) => u.lifetime_jobs >= 2).length;
console.log(`customers to update: ${updates.length} (spent $1k+: ${spent1k}, 2+ paid jobs: ${repeat})`);
console.log(`total lifetime revenue being recorded: $${(updates.reduce((s, u) => s + u.lifetime_revenue_cents, 0) / 100).toLocaleString()}`);

if (!apply) {
  console.log("Dry run. Re-run with --apply to write.");
  process.exit(0);
}

let done = 0;
for (const u of updates) {
  const { id, ...fields } = u;
  const r = await fetch(`${base}/customers?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(fields),
  });
  if (!r.ok) { console.error(`customer ${id}: ${r.status} ${await r.text()}`); continue; }
  done += 1;
}
console.log(`updated ${done} of ${updates.length} customers`);

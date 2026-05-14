#!/usr/bin/env node
/**
 * ServiceTitan active-jobs export → Supabase jobs table.
 *
 * One-shot import of jobs currently on Jay's books (Scheduled, Dispatched,
 * In Progress, etc.). Populates the dispatch board on day one of the new
 * system so it isn't empty.
 *
 * Reads an xlsx export from the ServiceTitan Jobs Report filtered to
 * status ≠ Completed and ≠ Cancelled. Tries every reasonable column-name
 * variant since ServiceTitan's column labels vary by plan tier.
 *
 * For each row:
 *   1. Look up the customer by normalized name (+ address if available).
 *   2. Look up the assigned crew member by normalized name.
 *   3. Map ServiceTitan status → our job_status enum.
 *   4. Build the job payload and UPSERT on servicetitan_job_id so re-runs
 *      are safe.
 *
 * Usage:
 *   node scripts/import-servicetitan-active-jobs.mjs <path-to-xlsx>
 *
 * Prereqs:
 *   - Migration 008 applied (adds servicetitan_job_id column on jobs).
 *   - .env.local with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *   - Customers + crew already loaded.
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";
import { excelSerialDateToIso, readExcelRows } from "./lib/read-excel-rows.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error("Usage: node scripts/import-servicetitan-active-jobs.mjs <path-to-xlsx>");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const normalize = (s) =>
  (s ?? "").toString().trim().replace(/\s+/g, " ").toLowerCase();

const titleCase = (s) =>
  (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// Read a value from a row using any of several possible column names
function pick(row, ...candidates) {
  for (const c of candidates) {
    if (row[c] != null && row[c] !== "") return row[c];
  }
  return null;
}

function parseLocation(loc) {
  if (!loc) return { street: null, city: null, zip: null };
  const cleaned = loc.toString().replace(/\bUSA\b\.?/i, "").trim().replace(/,\s*$/, "");
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const street = parts.slice(0, parts.length - 2).join(", ");
    const city = parts[parts.length - 2];
    const m = parts[parts.length - 1].match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i);
    return { street, city, zip: m?.[2] ?? null };
  }
  return { street: cleaned, city: null, zip: null };
}

function toIso(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return excelSerialDateToIso(v);
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

// Map ServiceTitan status text → our job_status enum.
// Conservative — anything unrecognized lands as 'scheduled' so it shows up
// on the dispatch board and Jay can manually transition it.
function mapStatus(raw) {
  const s = normalize(raw);
  if (!s) return "scheduled";
  if (/(complete|done|finished|paid|invoiced)/.test(s)) return "complete";
  if (/(cancel|void)/.test(s)) return "cancelled";
  if (/(en\s*route|notified|dispatch|traveling)/.test(s)) return "en_route";
  if (/(on\s*site|working|in\s*progress|started)/.test(s)) return "on_site";
  if (/(hold|paus|wait)/.test(s)) return "paused";
  return "scheduled";
}

// ──────────────────────────────────────────────────────────────────────────
// Read the workbook
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n📄 Reading: ${xlsxPath}\n`);
const { sheetName, rows: raw } = await readExcelRows(xlsxPath);
console.log(`Loaded ${raw.length} active-job rows from sheet "${sheetName}".`);

if (raw.length > 0) {
  console.log(`\nDetected columns:`);
  for (const k of Object.keys(raw[0])) {
    console.log(`  · ${k}`);
  }
  console.log("");
}

// ──────────────────────────────────────────────────────────────────────────
// Pre-fetch customers + crew lookup maps
// ──────────────────────────────────────────────────────────────────────────

console.log(`🔎 Loading customers + crew for lookup...`);

async function fetchAll(table, columns) {
  const out = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

const customers = await fetchAll(
  "customers",
  "id, name, street_address, city, zip, servicetitan_customer_id"
);
const crew = await fetchAll("crew", "id, full_name, role");

const custByStId = new Map(
  customers.filter((c) => c.servicetitan_customer_id).map((c) => [c.servicetitan_customer_id, c])
);
const custByName = new Map();
for (const c of customers) {
  const k = normalize(c.name);
  if (!custByName.has(k)) custByName.set(k, c);
}
const crewByName = new Map(crew.map((c) => [normalize(c.full_name), c]));

console.log(`  ↳ ${customers.length} customers, ${crew.length} crew loaded.\n`);

// ──────────────────────────────────────────────────────────────────────────
// Build payloads
// ──────────────────────────────────────────────────────────────────────────

const payloads = [];
const unmatchedCustomers = new Set();
const unmatchedCrew = new Set();
let dropped = 0;

for (const row of raw) {
  const stJobId =
    pick(row, "Job ID", "Job Id", "Id", "Job Number", "Number")?.toString() ?? null;

  const customerName = pick(row, "Customer", "Customer Name", "Customer Full Name");
  const stCustId = pick(row, "Customer Id", "Customer ID")?.toString() ?? null;

  // Customer lookup: prefer ServiceTitan customer ID match, fall back to name
  let customer =
    (stCustId && custByStId.get(stCustId)) ?? (customerName && custByName.get(normalize(customerName)));

  if (!customer && customerName) {
    unmatchedCustomers.add(customerName);
  }

  const locationRaw = pick(row, "Location", "Service Address", "Address", "Full Address");
  const location = parseLocation(locationRaw);

  const techName = pick(row, "Technician", "Technicians", "Assigned Technician", "Assigned Tech", "Tech");
  let assignee = null;
  if (techName) {
    // ServiceTitan sometimes returns comma-separated names; take first
    const primary = techName.toString().split(",")[0].trim();
    assignee = crewByName.get(normalize(primary)) ?? null;
    if (!assignee) unmatchedCrew.add(primary);
  }

  const serviceType = pick(row, "Job Type", "Service Type", "Type", "Service") ?? "Other";
  const status = mapStatus(pick(row, "Status", "Job Status"));
  const scheduledStart = toIso(
    pick(row, "Scheduled Date", "Scheduled", "Scheduled Date/Time", "Start", "Appointment", "Appointment Time")
  );
  const notes = pick(row, "Description", "Job Notes", "Notes", "Summary");

  // We require at least a customer match OR a customer name to record the job
  if (!customer && !customerName) {
    dropped++;
    continue;
  }

  payloads.push({
    servicetitan_job_id: stJobId,
    customer_id: customer?.id ?? null,
    service_type: serviceType,
    service_label: serviceType,
    status,
    scheduled_start: scheduledStart,
    job_address: location.street ?? locationRaw ?? null,
    job_city: location.city ?? customer?.city ?? null,
    job_zip: location.zip ?? customer?.zip ?? null,
    customer_notes: notes ?? null,
    internal_notes: customer
      ? null
      : `IMPORTED: customer not found in directory · raw name "${customerName}" · raw location "${locationRaw ?? ""}". Link manually.`,
    assigned_to: assignee?.id ?? null,
  });
}

console.log(`📊 Plan:`);
console.log(`   Job rows to upsert:               ${payloads.length}`);
console.log(`   Dropped (no customer name or ID): ${dropped}`);
console.log(`   Unmatched customer names:         ${unmatchedCustomers.size}`);
console.log(`   Unmatched technician names:       ${unmatchedCrew.size}`);

if (unmatchedCustomers.size > 0) {
  console.log(`\n   Customer-name misses (first 10):`);
  for (const n of [...unmatchedCustomers].slice(0, 10)) console.log(`     · ${n}`);
}
if (unmatchedCrew.size > 0) {
  console.log(`\n   Crew-name misses (first 10):`);
  for (const n of [...unmatchedCrew].slice(0, 10)) console.log(`     · ${n}`);
  console.log(`\n   These jobs will import with assigned_to = null. Reassign in admin.`);
}

// ──────────────────────────────────────────────────────────────────────────
// Upsert in chunks
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n➕ Upserting jobs...`);
const CHUNK = 50;
let inserted = 0;
let errors = 0;

for (let i = 0; i < payloads.length; i += CHUNK) {
  const chunk = payloads.slice(i, i + CHUNK);

  // Only rows with a ST job ID can upsert by it. The rest go via plain insert.
  const withId = chunk.filter((p) => p.servicetitan_job_id);
  const withoutId = chunk.filter((p) => !p.servicetitan_job_id);

  if (withId.length > 0) {
    const { data, error } = await sb
      .from("jobs")
      .upsert(withId, { onConflict: "servicetitan_job_id" })
      .select("id");
    if (error) {
      errors++;
      console.error(`  ✗ upsert chunk: ${error.message}`);
    } else {
      inserted += data.length;
    }
  }
  if (withoutId.length > 0) {
    const { data, error } = await sb.from("jobs").insert(withoutId).select("id");
    if (error) {
      errors++;
      console.error(`  ✗ insert chunk: ${error.message}`);
    } else {
      inserted += data.length;
    }
  }
  process.stdout.write(`  ↳ ${inserted}/${payloads.length} imported\r`);
}

console.log(`\n  ✓ ${inserted} jobs in jobs table. ${errors} chunk errors.\n`);

// ──────────────────────────────────────────────────────────────────────────
// Final tallies
// ──────────────────────────────────────────────────────────────────────────

const { count } = await sb.from("jobs").select("id", { count: "exact", head: true });

console.log(`────────────────────────────────────────────────────────`);
console.log(`✅ Active job import complete.`);
console.log(`────────────────────────────────────────────────────────`);
console.log(`   Jobs in DB total:           ${count}`);
console.log(`   Imported this run:          ${inserted}`);
console.log(`   Unmatched customers:        ${unmatchedCustomers.size}`);
console.log(`   Unmatched crew:             ${unmatchedCrew.size}`);
console.log(`────────────────────────────────────────────────────────`);
console.log(`Open /admin/dispatch/ to see today's board.\n`);

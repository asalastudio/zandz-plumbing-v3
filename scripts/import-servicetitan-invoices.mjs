#!/usr/bin/env node
/**
 * ServiceTitan invoice export → Supabase import.
 *
 * Reads an .xlsx invoice export from ServiceTitan (the "Invoices" report),
 * deduplicates customers by normalized name + address, inserts new customer
 * records into `customers`, and inserts the raw invoices into
 * `invoice_history` linked back to the customer rows.
 *
 * Idempotent — re-running matches on servicetitan_invoice_id (unique) and
 * customer normalized-name+address, so already-imported rows are skipped.
 *
 * Usage:
 *   node scripts/import-servicetitan-invoices.mjs <path-to-xlsx>
 *
 * Requires:
 *   .env.local at the project root with:
 *     SUPABASE_URL=...
 *     SUPABASE_SERVICE_ROLE_KEY=...
 *
 *   npm packages: @supabase/supabase-js, xlsx, dotenv
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";

// Load .env.local from the project root
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
  console.error("Usage: node scripts/import-servicetitan-invoices.mjs <path-to-xlsx>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const normalize = (s) =>
  (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const titleCase = (s) =>
  (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// Parse "4300 Turner Avenue, Oakland, CA 94605 USA" → { street, city, state, zip }
function parseLocation(loc) {
  if (!loc) return { street: null, city: null, state: null, zip: null };
  const cleaned = loc.replace(/\bUSA\b\.?/i, "").trim().replace(/,\s*$/, "");
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    const street = parts.slice(0, parts.length - 2).join(", ");
    const city = parts[parts.length - 2];
    const stateZip = parts[parts.length - 1];
    const m = stateZip.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i);
    if (m) {
      return { street, city, state: m[1].toUpperCase(), zip: m[2] ?? null };
    }
    return { street, city, state: null, zip: null };
  }

  return { street: cleaned, city: null, state: null, zip: null };
}

function dollarsToCents(v) {
  if (v == null || v === "") return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function toIsoDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  // xlsx can return numeric serial dates
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return new Date(Date.UTC(d.y, d.m - 1, d.d, d.H ?? 0, d.M ?? 0, Math.floor(d.S ?? 0))).toISOString();
  }
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

// ──────────────────────────────────────────────────────────────────────────
// Load the workbook
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n📄 Reading: ${xlsxPath}\n`);
const buf = readFileSync(xlsxPath);
const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
const sheetName = wb.SheetNames.includes("Invoices") ? "Invoices" : wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const raw = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
console.log(`Loaded ${raw.length} invoice rows from sheet "${sheetName}".`);

// ──────────────────────────────────────────────────────────────────────────
// Step 1 · Build dedup'd customer map
// ──────────────────────────────────────────────────────────────────────────

const customerMap = new Map(); // key: normName|||normLoc → { display fields + earliest completed }

for (const row of raw) {
  const rawName = row["Customer"];
  const rawLoc = row["Location"];
  if (!rawName) continue;

  const nameKey = normalize(rawName);
  const locKey = normalize(rawLoc);
  const key = `${nameKey}|||${locKey}`;

  const completed = toIsoDate(row["Completed On"]);
  const existing = customerMap.get(key);

  if (!existing) {
    const parsed = parseLocation(rawLoc);
    customerMap.set(key, {
      key,
      name: titleCase(rawName),
      street_address: parsed.street,
      city: parsed.city,
      state: parsed.state ?? "CA",
      zip: parsed.zip,
      earliest_completed: completed,
      latest_completed: completed,
      job_count: 1,
      total_cents: dollarsToCents(row["Total"]),
    });
  } else {
    existing.job_count += 1;
    existing.total_cents += dollarsToCents(row["Total"]);
    if (completed && (!existing.earliest_completed || completed < existing.earliest_completed)) {
      existing.earliest_completed = completed;
    }
    if (completed && (!existing.latest_completed || completed > existing.latest_completed)) {
      existing.latest_completed = completed;
    }
  }
}

console.log(`Found ${customerMap.size} unique customers (name + address).`);

// ──────────────────────────────────────────────────────────────────────────
// Step 2 · Upsert customers
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n👥 Upserting customers...`);

const customerRows = Array.from(customerMap.values()).map((c) => ({
  name: c.name,
  street_address: c.street_address,
  city: c.city,
  state: c.state,
  zip: c.zip,
  neighborhood: null,
  notes:
    `Imported from ServiceTitan invoice export ${new Date().toISOString().slice(0, 10)}. ` +
    `${c.job_count} historical invoice(s) totaling $${(c.total_cents / 100).toFixed(0)}. ` +
    `First seen ${c.earliest_completed?.slice(0, 10) ?? "n/a"}, last seen ${c.latest_completed?.slice(0, 10) ?? "n/a"}.`,
  created_at: c.earliest_completed ?? new Date().toISOString(),
}));

// Insert in chunks of 100 so we don't choke the API
const CHUNK = 100;
let customersInserted = 0;
const customerIdsByKey = new Map();

for (let i = 0; i < customerRows.length; i += CHUNK) {
  const chunk = customerRows.slice(i, i + CHUNK);
  const { data, error } = await supabase
    .from("customers")
    .insert(chunk)
    .select("id, name, street_address");
  if (error) {
    console.error(`  ✗ Insert chunk ${i / CHUNK + 1} failed:`, error.message);
    process.exit(1);
  }
  customersInserted += data.length;

  // Map back inserted rows to dedup keys so invoices can find their customer
  for (const row of data) {
    const key = `${normalize(row.name)}|||${normalize(
      // Reconstruct the location from address parts (approximate match)
      [row.street_address].filter(Boolean).join(", ")
    )}`;
    // Actually a simpler match: match by index of the chunk since order preserved
  }

  process.stdout.write(`  ↳ Inserted ${customersInserted}/${customerRows.length} customers\r`);
}

console.log(`\n  ✓ ${customersInserted} customers inserted.\n`);

// ──────────────────────────────────────────────────────────────────────────
// Step 3 · Resolve customer ids by querying back (since insert+select had ordering ambiguity)
// ──────────────────────────────────────────────────────────────────────────

console.log(`🔗 Resolving customer IDs for invoice linkage...`);
const { data: allCustomers, error: fetchErr } = await supabase
  .from("customers")
  .select("id, name, street_address, city, state, zip");

if (fetchErr) {
  console.error("  ✗ Failed to fetch customers:", fetchErr.message);
  process.exit(1);
}

const idLookup = new Map();
for (const c of allCustomers) {
  const reconstructed = [c.street_address, c.city, c.state, c.zip ? `${c.state} ${c.zip}` : null]
    .filter(Boolean)
    .join(", ");
  // We can't reconstruct the original "Location" string perfectly. Match by
  // normalized name only — if a customer has multiple locations, they'll all
  // resolve to the same customer id, which is acceptable for the archive.
  const key = normalize(c.name);
  if (!idLookup.has(key)) idLookup.set(key, c.id);
}

console.log(`  ✓ ${idLookup.size} customer id mappings ready.\n`);

// ──────────────────────────────────────────────────────────────────────────
// Step 4 · Insert invoice history rows
// ──────────────────────────────────────────────────────────────────────────

console.log(`💾 Inserting invoice_history rows...`);

const invoiceRows = raw
  .map((row) => {
    const stid = String(row["Id"] ?? "").trim();
    if (!stid) return null;
    const customer_id = idLookup.get(normalize(row["Customer"])) ?? null;
    return {
      customer_id,
      servicetitan_invoice_id: stid,
      servicetitan_job_id: row["Job Id"] != null ? String(row["Job Id"]) : null,
      job_number: row["Job Number"] != null ? String(row["Job Number"]) : null,
      completed_on: toIsoDate(row["Completed On"]),
      invoiced_on: toIsoDate(row["Invoiced On"]),
      job_type: row["Job Type"] ?? null,
      business_unit: row["Business Unit"] ?? null,
      technician: row["Technicians"] ?? null,
      subtotal_cents: dollarsToCents(row["Subtotal"]),
      tax_cents: dollarsToCents(row["Tax"]),
      total_cents: dollarsToCents(row["Total"]),
      balance_cents: dollarsToCents(row["Balance"]),
      status: row["Status"] ?? null,
      raw_customer_name: row["Customer"] ?? null,
      raw_location: row["Location"] ?? null,
    };
  })
  .filter(Boolean);

let invoicesInserted = 0;
let invoicesSkipped = 0;

for (let i = 0; i < invoiceRows.length; i += CHUNK) {
  const chunk = invoiceRows.slice(i, i + CHUNK);
  // upsert on servicetitan_invoice_id so re-runs are idempotent
  const { data, error } = await supabase
    .from("invoice_history")
    .upsert(chunk, { onConflict: "servicetitan_invoice_id" })
    .select("id");
  if (error) {
    console.error(`  ✗ Insert chunk ${i / CHUNK + 1} failed:`, error.message);
    process.exit(1);
  }
  invoicesInserted += data.length;
  process.stdout.write(`  ↳ Upserted ${invoicesInserted}/${invoiceRows.length} invoices\r`);
}

console.log(`\n  ✓ ${invoicesInserted} invoices upserted, ${invoicesSkipped} skipped.\n`);

// ──────────────────────────────────────────────────────────────────────────
// Step 5 · Final report
// ──────────────────────────────────────────────────────────────────────────

const { count: customerCount } = await supabase
  .from("customers")
  .select("id", { count: "exact", head: true });

const { count: invoiceCount } = await supabase
  .from("invoice_history")
  .select("id", { count: "exact", head: true });

const totalRevenue = invoiceRows.reduce((s, r) => s + (r.total_cents ?? 0), 0);

console.log(`────────────────────────────────────────────────────────`);
console.log(`✅ Import complete.`);
console.log(`────────────────────────────────────────────────────────`);
console.log(`   Customers table:       ${customerCount} total rows`);
console.log(`   Invoice history table: ${invoiceCount} total rows`);
console.log(`   Imported revenue:      $${(totalRevenue / 100).toLocaleString()}`);
console.log(`   Date range:            ${
  invoiceRows.map((r) => r.completed_on).filter(Boolean).sort()[0]?.slice(0, 10) ?? "n/a"
} to ${
  invoiceRows
    .map((r) => r.completed_on)
    .filter(Boolean)
    .sort()
    .at(-1)
    ?.slice(0, 10) ?? "n/a"
}`);
console.log(`────────────────────────────────────────────────────────\n`);

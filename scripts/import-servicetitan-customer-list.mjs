#!/usr/bin/env node
/**
 * ServiceTitan Customer List → Supabase customers table.
 *
 * Reads the Customer List export (Customer ID, Name, Type, Phone, Email,
 * Full Address, Do Not Mail / Service flags, Lifetime metrics). For each
 * row:
 *   1. Match against existing customer in Supabase by normalized name +
 *      address (the 969 rows previously imported from invoice export).
 *   2. If matched: UPDATE existing row with phone, email, ServiceTitan
 *      Customer ID, type, lifetime metrics. Preserve existing notes.
 *   3. If not matched: INSERT new customer with all fields.
 *
 * Idempotent — re-runs match on servicetitan_customer_id (unique) and
 * update-only those rows.
 *
 * Usage:
 *   node scripts/import-servicetitan-customer-list.mjs <path-to-xlsx>
 *
 * Prerequisite: migration 005 applied.
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import websocket from "ws";

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
  console.error("Usage: node scripts/import-servicetitan-customer-list.mjs <path-to-xlsx>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: websocket },
});

// ──────────────────────────────────────────────────────────────────────────
// Normalizers
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

function parseLocation(loc) {
  if (!loc) return { street: null, city: null, state: null, zip: null };
  const cleaned = loc.toString().replace(/\bUSA\b\.?/i, "").trim().replace(/,\s*$/, "");
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    const street = parts.slice(0, parts.length - 2).join(", ");
    const city = parts[parts.length - 2];
    const stateZip = parts[parts.length - 1];
    const m = stateZip.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i);
    if (m) {
      return { street: titleCase(street), city: titleCase(city), state: m[1].toUpperCase(), zip: m[2] ?? null };
    }
    return { street: titleCase(street), city: titleCase(city), state: null, zip: null };
  }
  if (parts.length === 2) {
    const m = parts[1].match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i);
    if (m) {
      return { street: titleCase(parts[0]), city: null, state: m[1].toUpperCase(), zip: m[2] ?? null };
    }
    return { street: titleCase(parts[0]), city: titleCase(parts[1]), state: null, zip: null };
  }
  return { street: titleCase(cleaned), city: null, state: null, zip: null };
}

function phoneToE164(raw) {
  if (!raw) return null;
  const digits = raw.toString().replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function normalizeEmail(raw) {
  if (!raw) return null;
  // ServiceTitan stores multiple emails as comma-separated lists with
  // "no@email.com" as a placeholder for "no email on file". Split on
  // commas (and semicolons just in case), filter out placeholders, take
  // the first one that passes basic email regex.
  const candidates = raw
    .toString()
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && s !== "no@email.com" && s !== "noemail@email.com");

  for (const c of candidates) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return c;
  }
  return null;
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
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return new Date(Date.UTC(d.y, d.m - 1, d.d, d.H ?? 0, d.M ?? 0, Math.floor(d.S ?? 0))).toISOString();
  }
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

// ──────────────────────────────────────────────────────────────────────────
// Read the customer list
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n📄 Reading: ${xlsxPath}\n`);
const buf = readFileSync(xlsxPath);
const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
const sheetName = wb.SheetNames.includes("Sheet1") ? "Sheet1" : wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const raw = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
console.log(`Loaded ${raw.length} customer rows from sheet "${sheetName}".`);

// ──────────────────────────────────────────────────────────────────────────
// Build a lookup of existing customers by normalized (name + address)
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n🔎 Fetching existing customers from Supabase...`);

// Have to paginate — Supabase default cap is 1000 rows per select.
async function fetchAllCustomers() {
  const out = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, street_address, city, state, zip, servicetitan_customer_id, notes")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

const existing = await fetchAllCustomers();
console.log(`  ↳ ${existing.length} existing customers loaded.`);

// Build name-only and name+street lookup maps
const byNameStreet = new Map();
const byName = new Map();
for (const c of existing) {
  const nameKey = normalize(c.name);
  const streetKey = normalize(c.street_address);
  byNameStreet.set(`${nameKey}|||${streetKey}`, c);
  if (!byName.has(nameKey)) byName.set(nameKey, c);
}

// ──────────────────────────────────────────────────────────────────────────
// Process each row: classify as UPDATE or INSERT, build payload
// ──────────────────────────────────────────────────────────────────────────

const updates = []; // { id, payload }
const inserts = []; // payload
let dropped = 0;

for (const row of raw) {
  const stId = row["Customer ID"] != null ? String(row["Customer ID"]).trim() : null;
  const name = (row["Customer Name"] ?? "").toString().trim();
  if (!name || !stId) {
    dropped++;
    continue;
  }

  const fullAddr = (row["Full Address"] ?? "").toString().trim();
  const parsed = parseLocation(fullAddr);

  const payload = {
    name: titleCase(name),
    phone_e164: phoneToE164(row["Phone Number"]),
    email: normalizeEmail(row["Email"]),
    street_address: parsed.street,
    city: parsed.city,
    state: parsed.state ?? "CA",
    zip: parsed.zip,
    servicetitan_customer_id: stId,
    customer_type: row["Type"] ?? null,
    lifetime_revenue_cents: dollarsToCents(row["Customers Lifetime Revenue"]),
    lifetime_jobs: row["Lifetime Jobs Completed"] ? Number(row["Lifetime Jobs Completed"]) : 0,
    last_job_completed_at: toIsoDate(row["Last Job Completed"]),
  };

  // Try matching: first by normalized name + street, then by normalized name only
  const nameKey = normalize(name);
  const streetKey = normalize(parsed.street);
  const match =
    byNameStreet.get(`${nameKey}|||${streetKey}`) ??
    byName.get(nameKey);

  if (match && !match.servicetitan_customer_id) {
    // Existing row, no ST ID yet — update it
    updates.push({ id: match.id, payload });
    // Remove from lookup so duplicates in the source don't both claim the same row
    byNameStreet.delete(`${nameKey}|||${streetKey}`);
    byName.delete(nameKey);
  } else if (match && match.servicetitan_customer_id === stId) {
    // Already linked, update fields anyway (idempotent re-run)
    updates.push({ id: match.id, payload });
  } else {
    inserts.push(payload);
  }
}

console.log(`\n📊 Plan:`);
console.log(`   Updates (matching existing rows):  ${updates.length}`);
console.log(`   Inserts (new customers):           ${inserts.length}`);
console.log(`   Dropped (missing ID or name):      ${dropped}`);

// ──────────────────────────────────────────────────────────────────────────
// Apply UPDATEs
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n✏️  Applying updates...`);
let updated = 0;
let updateErrors = 0;
for (const { id, payload } of updates) {
  const { error } = await supabase.from("customers").update(payload).eq("id", id);
  if (error) {
    updateErrors++;
    if (updateErrors <= 3) console.error(`  ✗ Update id=${id}: ${error.message}`);
  } else {
    updated++;
  }
  if (updated % 50 === 0) process.stdout.write(`  ↳ ${updated}/${updates.length} updated\r`);
}
console.log(`  ↳ ${updated}/${updates.length} updated. ${updateErrors} errors.`);

// ──────────────────────────────────────────────────────────────────────────
// Apply INSERTs (in chunks)
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n➕ Inserting new customers...`);
const CHUNK = 100;
let inserted = 0;
let insertErrors = 0;
for (let i = 0; i < inserts.length; i += CHUNK) {
  const chunk = inserts.slice(i, i + CHUNK);
  const { data, error } = await supabase
    .from("customers")
    .upsert(chunk, { onConflict: "servicetitan_customer_id" })
    .select("id");
  if (error) {
    insertErrors++;
    console.error(`  ✗ Insert chunk ${i / CHUNK + 1}: ${error.message}`);
  } else {
    inserted += data.length;
  }
  process.stdout.write(`  ↳ ${inserted}/${inserts.length} inserted\r`);
}
console.log(`  ↳ ${inserted}/${inserts.length} inserted. ${insertErrors} chunk errors.`);

// ──────────────────────────────────────────────────────────────────────────
// Re-link invoice_history rows by name (so any newly imported customers
// pick up their historical invoices that were stranded after the first run)
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n🔗 Re-linking invoice_history rows by customer name...`);

// Refetch customers (now ~2753) and rebuild name index
const refreshed = await fetchAllCustomers();
const idByName = new Map();
for (const c of refreshed) {
  const k = normalize(c.name);
  if (!idByName.has(k)) idByName.set(k, c.id);
}

// Get unique customer names from invoice_history with NULL customer_id
const { data: stranded, error: strandedErr } = await supabase
  .from("invoice_history")
  .select("id, raw_customer_name")
  .is("customer_id", null);

if (strandedErr) {
  console.error(`  ✗ ${strandedErr.message}`);
} else {
  let relinked = 0;
  for (const row of stranded) {
    const cid = idByName.get(normalize(row.raw_customer_name));
    if (cid) {
      const { error: linkErr } = await supabase
        .from("invoice_history")
        .update({ customer_id: cid })
        .eq("id", row.id);
      if (!linkErr) relinked++;
    }
  }
  console.log(`  ↳ ${relinked} of ${stranded.length} stranded invoices re-linked.`);
}

// ──────────────────────────────────────────────────────────────────────────
// Final tallies
// ──────────────────────────────────────────────────────────────────────────

const { count: totalCustomers } = await supabase
  .from("customers")
  .select("id", { count: "exact", head: true });

const { count: withPhone } = await supabase
  .from("customers")
  .select("id", { count: "exact", head: true })
  .not("phone_e164", "is", null);

const { count: withEmail } = await supabase
  .from("customers")
  .select("id", { count: "exact", head: true })
  .not("email", "is", null);

const { count: withStId } = await supabase
  .from("customers")
  .select("id", { count: "exact", head: true })
  .not("servicetitan_customer_id", "is", null);

console.log(`\n────────────────────────────────────────────────────────`);
console.log(`✅ Customer list import complete.`);
console.log(`────────────────────────────────────────────────────────`);
console.log(`   Total customers:           ${totalCustomers}`);
console.log(`   With phone (E.164):        ${withPhone} (${Math.round(100*withPhone/totalCustomers)}%)`);
console.log(`   With email:                ${withEmail} (${Math.round(100*withEmail/totalCustomers)}%)`);
console.log(`   With ServiceTitan ID:      ${withStId} (${Math.round(100*withStId/totalCustomers)}%)`);
console.log(`────────────────────────────────────────────────────────\n`);

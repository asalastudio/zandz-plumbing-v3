#!/usr/bin/env node
/**
 * ServiceTitan Pricebook (Services sheet) → Supabase service_catalog.
 *
 * Reads the "Services" sheet of a ServiceTitan pricebook export and upserts
 * each row into service_catalog. The saved Description (the scope-of-work the
 * tech wrote once, e.g. H6110's water-heater steps) becomes the text that the
 * invoice builder auto-fills, so operators never retype it.
 *
 * Idempotent — upserts by `code`, so re-running after a pricebook change just
 * refreshes the rows.
 *
 * Usage:
 *   node scripts/import-servicetitan-pricebook.mjs <path-to-pricebook.xlsx>
 *
 * Prerequisite: migration 009_service_catalog.sql applied. Requires
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import readXlsxFile from "read-excel-file/node";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-servicetitan-pricebook.mjs <path-to-pricebook.xlsx>");
  process.exit(1);
}

function toCents(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
function toBool(value, dflt = true) {
  if (value === 1 || value === "1" || value === true) return true;
  if (value === 0 || value === "0" || value === false) return false;
  return dflt;
}
function str(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

const sheets = await readXlsxFile(filePath);
const services = sheets.find((s) => s.sheet === "Services");
if (!services) {
  console.error('No "Services" sheet found in the export.');
  process.exit(1);
}

const [header, ...dataRows] = services.data;
const idx = (name) => header.indexOf(name);
const C = {
  code: idx("Code"),
  id: idx("Id"),
  name: idx("Name"),
  description: idx("Description"),
  category: idx("Category.Name"),
  price: idx("Price"),
  materialCost: idx("MaterialCost"),
  hours: idx("Hours"),
  taxable: idx("Taxable"),
  active: idx("Active"),
};

const byCode = new Map();
for (const row of dataRows) {
  const code = str(row[C.code]);
  const name = str(row[C.name]);
  if (!code || !name) continue; // skip blank/placeholder rows
  byCode.set(code, {
    code,
    servicetitan_sku_id: str(row[C.id]),
    name,
    description: str(row[C.description]),
    category: str(row[C.category]),
    price_cents: toCents(row[C.price]),
    cost_cents: toCents(row[C.materialCost]),
    hours: Number.isFinite(Number(row[C.hours])) ? Number(row[C.hours]) : null,
    taxable: toBool(row[C.taxable], true),
    active: toBool(row[C.active], true),
  });
}
const records = [...byCode.values()];
console.log(`Parsed ${records.length} unique services from "${services.sheet}".`);

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let upserted = 0;
const BATCH = 200;
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH).map((r) => ({ ...r, updated_at: new Date().toISOString() }));
  const { error } = await sb.from("service_catalog").upsert(batch, { onConflict: "code" });
  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }
  upserted += batch.length;
  console.log(`  upserted ${upserted}/${records.length}`);
}

console.log(`Done. ${upserted} services in service_catalog.`);

// ── Materials (parts) ──
const materialsSheet = sheets.find((s) => s.sheet === "Materials");
if (materialsSheet && materialsSheet.data.length > 1) {
  const [mh, ...mrows] = materialsSheet.data;
  const mi = (n) => mh.indexOf(n);
  const M = {
    code: mi("Code"), id: mi("Id"), name: mi("Name"), description: mi("Description"),
    category: mi("Category.Name"), price: mi("Price"), cost: mi("Cost"),
    unit: mi("UnitOfMeasure"), active: mi("Active"),
  };
  const matByCode = new Map();
  for (const row of mrows) {
    const code = str(row[M.code]);
    const name = str(row[M.name]);
    if (!code || !name) continue;
    matByCode.set(code, {
      code,
      servicetitan_sku_id: str(row[M.id]),
      name,
      description: str(row[M.description]),
      category: str(row[M.category]),
      price_cents: toCents(row[M.price]),
      cost_cents: toCents(row[M.cost]),
      unit: str(row[M.unit]) || null,
      active: toBool(row[M.active], true),
    });
  }
  const mats = [...matByCode.values()];
  for (let i = 0; i < mats.length; i += BATCH) {
    const batch = mats.slice(i, i + BATCH).map((r) => ({ ...r, updated_at: new Date().toISOString() }));
    const { error } = await sb.from("materials").upsert(batch, { onConflict: "code" });
    if (error) {
      console.error("materials upsert failed:", error.message);
      process.exit(1);
    }
  }
  console.log(`Done. ${mats.length} materials in materials.`);

  // ── Service → material links ──
  const linksSheet = sheets.find((s) => s.sheet === "ServiceMaterialLinks");
  if (linksSheet && linksSheet.data.length > 1) {
    const [lh, ...lrows] = linksSheet.data;
    const li = (n) => lh.indexOf(n);
    const L = { svc: li("Service.Code"), mat: li("Material.Code"), qty: li("Quantity"), active: li("Active") };
    const linkByKey = new Map();
    for (const row of lrows) {
      const service_code = str(row[L.svc]);
      const material_code = str(row[L.mat]);
      if (!service_code || !material_code) continue;
      if (!matByCode.has(material_code)) continue; // FK safety: skip links to unknown materials
      linkByKey.set(`${service_code}|${material_code}`, {
        service_code,
        material_code,
        quantity: Number.isFinite(Number(row[L.qty])) ? Number(row[L.qty]) : 1,
        active: toBool(row[L.active], true),
      });
    }
    const links = [...linkByKey.values()];
    for (let i = 0; i < links.length; i += BATCH) {
      const batch = links.slice(i, i + BATCH);
      const { error } = await sb
        .from("service_materials")
        .upsert(batch, { onConflict: "service_code,material_code" });
      if (error) {
        console.error("service_materials upsert failed:", error.message);
        process.exit(1);
      }
    }
    console.log(`Done. ${links.length} service→material links in service_materials.`);
  }
} else {
  console.log('No "Materials" sheet found — skipping materials import.');
}

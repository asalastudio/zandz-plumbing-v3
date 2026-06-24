-- Z and Z OS · Service catalog (pricebook)
-- Run AFTER 002 (fsm_core) is in place.
--
-- Mirrors the ServiceTitan pricebook: one row per service the company sells,
-- each carrying a saved code, a multiline "item description" (the scope of
-- work that ServiceTitan auto-fills onto estimates/invoices), and a default
-- price. The invoice builder's line-item Description becomes a picker over
-- this table so operators select a code instead of typing the scope by hand.
--
-- Seeded from a ServiceTitan pricebook export and re-importable without dupes
-- via the unique `code` (and `servicetitan_sku_id` when present).

set search_path = public;

create table if not exists service_catalog (
  id                   bigserial primary key,

  -- Pricebook identity (from the ServiceTitan export)
  code                 text not null unique,   -- e.g. "H6110"
  servicetitan_sku_id  text unique,            -- numeric SKU id, when the export carries one

  -- Display + content
  name                 text not null,          -- short display name
  description          text,                   -- full multiline scope of work ("Item Description")
  category             text,                   -- e.g. "Water Heater", "Drain", "Sewer"

  -- Pricing (cents, to avoid floating-point money math)
  price_cents          integer default 0,
  cost_cents           integer default 0,

  -- Housekeeping
  hours                numeric,                -- estimated labor hours, if exported
  taxable              boolean default true,
  active               boolean default true,

  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists service_catalog_active   on service_catalog (active);
create index if not exists service_catalog_category on service_catalog (category);
create index if not exists service_catalog_name     on service_catalog (name);

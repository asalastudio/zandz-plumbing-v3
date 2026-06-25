-- Z and Z OS · Materials (parts) + service→material links
-- Run AFTER 009_service_catalog.sql.
--
-- Imported from the ServiceTitan pricebook export's "Materials" and
-- "ServiceMaterialLinks" sheets so the assistant can answer "what parts does
-- this job need." (The export's "Equipment" sheet is empty, so no equipment
-- table.) Re-importable without dupes via unique code / (service, material).

set search_path = public;

create table if not exists materials (
  id                   bigserial primary key,
  code                 text not null unique,
  servicetitan_sku_id  text unique,
  name                 text not null,
  description          text,
  category             text,
  price_cents          integer default 0,
  cost_cents           integer default 0,
  unit                 text,            -- UnitOfMeasure
  active               boolean default true,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists materials_active on materials (active);
create index if not exists materials_name   on materials (name);

create table if not exists service_materials (
  id             bigserial primary key,
  service_code   text not null,                                   -- → service_catalog.code (plain; not all codes guaranteed present)
  material_code  text not null references materials(code) on delete cascade,
  quantity       numeric default 1,
  active         boolean default true,
  unique (service_code, material_code)
);

create index if not exists service_materials_service  on service_materials (service_code);
create index if not exists service_materials_material on service_materials (material_code);

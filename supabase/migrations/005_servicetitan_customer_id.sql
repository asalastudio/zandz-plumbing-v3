-- Z and Z OS · Phase 2 · ServiceTitan customer ID link
-- Run AFTER 001/002/003/004.
--
-- Adds a stable foreign key from the customers table back to ServiceTitan's
-- Customer ID. Used by the customer-list import script to upsert by ID and
-- by any future ServiceTitan sync work.

set search_path = public;

alter table customers
  add column if not exists servicetitan_customer_id text;

create unique index if not exists customers_st_id_unique
  on customers (servicetitan_customer_id)
  where servicetitan_customer_id is not null;

-- Customer type (Residential / Commercial / Unknown)
alter table customers
  add column if not exists customer_type text;

-- Lifetime metrics carried over from ServiceTitan (informational only)
alter table customers
  add column if not exists lifetime_revenue_cents bigint default 0;

alter table customers
  add column if not exists lifetime_jobs integer default 0;

alter table customers
  add column if not exists last_job_completed_at timestamptz;

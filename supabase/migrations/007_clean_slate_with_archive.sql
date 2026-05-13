-- Z and Z OS · Clean slate · archive legacy financial data
--
-- Rationale: the ServiceTitan invoice history showed a $328K open balance
-- across 186 invoices — clearly not real A/R. Most were "Pending" statuses
-- that never got updated to "Paid" when payment was collected outside
-- ServiceTitan. The financial data is unreliable for analytics.
--
-- This migration moves all 1,090 historical invoices to an archive table
-- (so we don't lose anything) and resets the financial summary fields on
-- the customers table. Going forward, Z and Z OS revenue numbers reflect
-- only jobs run through the new system.
--
-- Preserved: customers table directory (names, phones, emails, addresses,
-- ServiceTitan IDs, customer types) and last_job_completed_at (so the
-- dormant-customer re-engagement view still works).
--
-- Reversible: the archive holds the original rows. To restore, copy them
-- back into invoice_history and recompute lifetime_* columns.

set search_path = public;

-- 1. Create the archive table with the same shape as invoice_history.
-- Schema mirrors migration 004 but adds an archived_at timestamp.
create table if not exists invoice_history_archive (
  id                       bigint primary key,
  customer_id              bigint,
  servicetitan_invoice_id  text,
  servicetitan_job_id      text,
  job_number               text,
  completed_on             timestamptz,
  invoiced_on              timestamptz,
  job_type                 text,
  business_unit            text,
  technician               text,
  subtotal_cents           integer default 0,
  tax_cents                integer default 0,
  total_cents              integer default 0,
  balance_cents            integer default 0,
  status                   text,
  raw_customer_name        text,
  raw_location             text,
  original_created_at      timestamptz,
  archived_at              timestamptz default now()
);

create index if not exists invoice_history_archive_customer
  on invoice_history_archive (customer_id);
create index if not exists invoice_history_archive_completed
  on invoice_history_archive (completed_on);
create index if not exists invoice_history_archive_st_id
  on invoice_history_archive (servicetitan_invoice_id);

-- 2. Copy every row from invoice_history into the archive.
-- Idempotent: only insert rows not already in the archive.
insert into invoice_history_archive (
  id, customer_id, servicetitan_invoice_id, servicetitan_job_id,
  job_number, completed_on, invoiced_on, job_type, business_unit,
  technician, subtotal_cents, tax_cents, total_cents, balance_cents,
  status, raw_customer_name, raw_location, original_created_at
)
select
  id, customer_id, servicetitan_invoice_id, servicetitan_job_id,
  job_number, completed_on, invoiced_on, job_type, business_unit,
  technician, subtotal_cents, tax_cents, total_cents, balance_cents,
  status, raw_customer_name, raw_location, created_at
from invoice_history
on conflict (id) do nothing;

-- 3. Wipe invoice_history. The dashboard, analytics, and customer-detail
-- pages all read from this table and will show $0 / empty until real jobs
-- flow through Z and Z OS.
truncate table invoice_history restart identity;

-- 4. Reset the financial summary fields on customers.
-- last_job_completed_at is preserved so dormant-customer outreach still works.
update customers
  set lifetime_revenue_cents = 0,
      lifetime_jobs          = 0;

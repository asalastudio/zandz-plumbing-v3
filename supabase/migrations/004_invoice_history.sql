-- Z and Z OS · Phase 2 · ServiceTitan invoice history archive
-- Run AFTER 001/002/003 are in place.
--
-- Stores historical invoices imported from ServiceTitan as a read-only
-- archive. The active dispatch workflow uses the `jobs` table; this
-- table holds closed/billed historical records linked to customers.

set search_path = public;

create table if not exists invoice_history (
  id                       bigserial primary key,
  customer_id              bigint references customers(id) on delete set null,

  -- ServiceTitan identifiers (so we can re-sync without dupes)
  servicetitan_invoice_id  text unique,
  servicetitan_job_id      text,
  job_number               text,

  -- Dates
  completed_on             timestamptz,
  invoiced_on              timestamptz,

  -- Job classification
  job_type                 text,
  business_unit            text,
  technician               text,

  -- Financials (stored as cents to avoid floating-point money math)
  subtotal_cents           integer default 0,
  tax_cents                integer default 0,
  total_cents              integer default 0,
  balance_cents            integer default 0,
  status                   text,

  -- Raw fields preserved in case customer linkage fails
  raw_customer_name        text,
  raw_location             text,

  created_at               timestamptz default now()
);

create index if not exists invoice_history_customer  on invoice_history (customer_id);
create index if not exists invoice_history_completed on invoice_history (completed_on);
create index if not exists invoice_history_technician on invoice_history (technician);

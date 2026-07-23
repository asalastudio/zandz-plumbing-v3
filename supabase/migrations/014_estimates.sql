-- Z and Z OS · Estimates
--
-- The company's flow is estimate first, then invoice: the customer is sent an
-- estimate, approves it, the work happens, and the invoice follows. The OS had
-- no estimate concept — only invoices — so this adds it as a first-class record
-- with its own lifecycle, and a one-way bridge into an invoice so the line
-- items are never retyped.
--
-- Deliberately mirrors the invoices table (same line_items jsonb shape, cents
-- money) so conversion is a straight copy and the PDF/line-item code is shared.

set search_path = public;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estimate_status') then
    create type estimate_status as enum (
      'draft',      -- being built
      'sent',       -- delivered to the customer
      'approved',   -- customer accepted (signed or verbally)
      'declined',   -- customer passed
      'converted'   -- turned into an invoice; terminal
    );
  end if;
end$$;

create table if not exists estimates (
  id                     bigserial primary key,
  customer_id            bigint references customers(id),
  job_id                 bigint references jobs(id),

  line_items             jsonb,          -- [{description, quantity, unit_price_cents, total_cents}]
  amount_cents           integer not null default 0,
  notes                  text,

  status                 estimate_status not null default 'draft',
  valid_until            date,           -- estimates expire; shown on the document

  -- Customer authorization. Captured either on paper (scan/keep) or, later, via
  -- a signature pad on the public view.
  signed_at              timestamptz,
  signed_name            text,

  -- The bridge. Set once the estimate becomes an invoice, so we never convert
  -- the same estimate twice and can link the two records.
  converted_invoice_id   bigint references invoices(id),
  converted_at           timestamptz,

  sent_at                timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index if not exists estimates_customer on estimates (customer_id);
create index if not exists estimates_job      on estimates (job_id);
create index if not exists estimates_status   on estimates (status);

-- Public share token for the customer-facing estimate view (mirrors how
-- invoices are shared at /i/[token]). Signed so the id is not guessable.
comment on table estimates is
  'Customer estimates. Estimate-first workflow: an approved estimate converts one-way into an invoice via convertEstimateToInvoice.';

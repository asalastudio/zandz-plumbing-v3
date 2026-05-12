-- Z and Z OS · Phase 2 · FSM Core
-- Run this AFTER 001_sms_review_automation.sql.
-- Schema for the custom FSM that replaces ServiceTitan: customers, crew, jobs,
-- invoices, photos, status log, and customer-facing tracking tokens.

set search_path = public;

-- ──────────────────────────────────────────────────────────────────────────
-- Crew (Jay, Seif, future field crew, future office staff)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists crew (
  id            bigserial primary key,
  email         text unique not null,
  name          text not null,
  role          text not null check (role in ('owner', 'lead_plumber', 'plumber', 'apprentice', 'helper', 'office')),
  phone_e164    text,
  active        boolean default true,
  password_hash text,                    -- bcrypt; nullable for SSO future
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Customers (our source of truth for FSM; cross-references HubSpot CRM)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists customers (
  id                  bigserial primary key,
  hubspot_contact_id  text unique,
  name                text not null,
  phone_e164          text,
  email               text,
  street_address      text,
  city                text,
  state               text default 'CA',
  zip                 text,
  neighborhood        text,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists customers_phone   on customers (phone_e164);
create index if not exists customers_hubspot on customers (hubspot_contact_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Jobs (the FSM record — replaces ServiceTitan's Job entity)
-- ──────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type job_status as enum (
      'new', 'scheduled', 'en_route', 'on_site', 'paused',
      'complete', 'invoiced', 'paid', 'cancelled'
    );
  end if;
end$$;

create table if not exists jobs (
  id                   bigserial primary key,
  customer_id          bigint references customers(id),
  hubspot_deal_id      text unique,
  service_type         text not null,                -- 'sewer-lateral', 'drain-cleaning', etc.
  service_label        text,                          -- human label, free-form
  status               job_status default 'new',
  scheduled_start      timestamptz,
  scheduled_end        timestamptz,
  job_address          text,
  job_city             text,
  job_zip              text,
  customer_notes       text,
  internal_notes       text,
  estimated_amount_cents int,
  final_amount_cents   int,
  created_by           bigint references crew(id),
  assigned_to          bigint references crew(id),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists jobs_status     on jobs (status);
create index if not exists jobs_scheduled  on jobs (scheduled_start);
create index if not exists jobs_customer   on jobs (customer_id);
create index if not exists jobs_assigned   on jobs (assigned_to);
create index if not exists jobs_hubspot    on jobs (hubspot_deal_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Job status log (audit + powers the customer-facing tracking page)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists job_status_log (
  id        bigserial primary key,
  job_id    bigint references jobs(id) on delete cascade,
  status    job_status not null,
  set_at    timestamptz default now(),
  set_by    bigint references crew(id),
  notes     text
);

create index if not exists job_status_log_job on job_status_log (job_id, set_at desc);

-- ──────────────────────────────────────────────────────────────────────────
-- Job photos (Vercel Blob URLs, before/after, failure docs)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists job_photos (
  id        bigserial primary key,
  job_id    bigint references jobs(id) on delete cascade,
  blob_url  text not null,
  caption   text,
  category  text check (category in ('before', 'after', 'failure', 'permit', 'invoice', 'other')),
  taken_at  timestamptz default now(),
  taken_by  bigint references crew(id)
);

create index if not exists job_photos_job on job_photos (job_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Invoices (Stripe Payment Links as the payment surface)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id                          bigserial primary key,
  job_id                      bigint references jobs(id),
  customer_id                 bigint references customers(id),
  amount_cents                int not null,
  stripe_payment_link_id      text,
  stripe_payment_link_url     text,
  stripe_checkout_session_id  text,
  line_items                  jsonb,            -- [{description, qty, unit_price_cents, total_cents}]
  sent_at                     timestamptz,
  paid_at                     timestamptz,
  payment_method              text,             -- 'card', 'check', 'cash', 'ach'
  notes                       text,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

create index if not exists invoices_job  on invoices (job_id);
create index if not exists invoices_paid on invoices (paid_at);

-- ──────────────────────────────────────────────────────────────────────────
-- Customer tracking tokens (public /track/[token] pages, no login)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists customer_tokens (
  id           bigserial primary key,
  token        text unique not null,
  customer_id  bigint references customers(id),
  job_id       bigint references jobs(id),
  expires_at   timestamptz,
  created_at   timestamptz default now()
);

create index if not exists customer_tokens_token on customer_tokens (token);
create index if not exists customer_tokens_job on customer_tokens (job_id);

-- ──────────────────────────────────────────────────────────────────────────
-- RLS lockdown (service role only)
-- ──────────────────────────────────────────────────────────────────────────
alter table crew              enable row level security;
alter table customers         enable row level security;
alter table jobs              enable row level security;
alter table job_status_log    enable row level security;
alter table job_photos        enable row level security;
alter table invoices          enable row level security;
alter table customer_tokens   enable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- Triggers
-- ──────────────────────────────────────────────────────────────────────────
drop trigger if exists trg_customers_updated on customers;
create trigger trg_customers_updated
  before update on customers
  for each row execute function set_updated_at();

drop trigger if exists trg_jobs_updated on jobs;
create trigger trg_jobs_updated
  before update on jobs
  for each row execute function set_updated_at();

drop trigger if exists trg_invoices_updated on invoices;
create trigger trg_invoices_updated
  before update on invoices
  for each row execute function set_updated_at();

drop trigger if exists trg_crew_updated on crew;
create trigger trg_crew_updated
  before update on crew
  for each row execute function set_updated_at();

-- Automatically log status changes into job_status_log
create or replace function log_job_status_change() returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into job_status_log (job_id, status, set_at)
    values (new.id, new.status, now());
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_jobs_status_log on jobs;
create trigger trg_jobs_status_log
  after update of status on jobs
  for each row execute function log_job_status_change();

-- Z and Z OS · Phase 1 · SMS Review Automation
-- Run this in Supabase SQL editor after creating the project.

set search_path = public;

-- ──────────────────────────────────────────────────────────────────────────
-- SMS consent (transactional record of who has opted in to texts)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists sms_consent (
  id              bigserial primary key,
  hubspot_contact_id text unique,
  phone_e164      text not null,
  customer_name   text not null,
  consented       boolean default false,
  consent_source  text,                       -- 'web_form', 'verbal', 'admin_manual'
  consent_captured_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists sms_consent_phone on sms_consent (phone_e164);

-- ──────────────────────────────────────────────────────────────────────────
-- Review requests (one per Won deal that meets consent criteria)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists review_requests (
  id                       bigserial primary key,
  hubspot_deal_id          text unique not null,
  hubspot_contact_id       text,
  customer_phone_e164      text not null,
  customer_name            text not null,
  service_performed        text,
  job_completed_at         timestamptz not null,
  scheduled_send_at        timestamptz not null,
  click_token              text unique not null,
  sent_at                  timestamptz,
  twilio_message_sid       text,
  link_clicked_at          timestamptz,
  click_count              int default 0,
  opted_out_at             timestamptz,
  cancelled_at             timestamptz,
  cancellation_reason      text,
  created_at               timestamptz default now()
);

create index if not exists review_requests_send_window
  on review_requests (scheduled_send_at)
  where sent_at is null and cancelled_at is null and opted_out_at is null;

create index if not exists review_requests_token
  on review_requests (click_token);

-- ──────────────────────────────────────────────────────────────────────────
-- SMS log (every inbound + outbound message for audit)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists sms_log (
  id                       bigserial primary key,
  direction                text not null check (direction in ('inbound', 'outbound')),
  from_e164                text not null,
  to_e164                  text not null,
  body                     text not null,
  twilio_message_sid       text,
  status                   text,
  error_code               text,
  error_message            text,
  related_review_request_id bigint references review_requests(id) on delete set null,
  created_at               timestamptz default now()
);

create index if not exists sms_log_phone_lookup on sms_log (from_e164, to_e164);
create index if not exists sms_log_review_request on sms_log (related_review_request_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Opt-outs (any phone that has STOP'd or been manually opted out)
-- This is the source of truth for "do not send"
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists sms_opt_outs (
  phone_e164    text primary key,
  opted_out_at  timestamptz default now(),
  source        text                    -- 'STOP_keyword', 'admin_manual'
);

-- ──────────────────────────────────────────────────────────────────────────
-- Row Level Security: lock everything to service role only.
-- Admin app accesses Supabase via the service role key on the server side.
-- ──────────────────────────────────────────────────────────────────────────
alter table sms_consent      enable row level security;
alter table review_requests  enable row level security;
alter table sms_log          enable row level security;
alter table sms_opt_outs     enable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- updated_at trigger
-- ──────────────────────────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sms_consent_updated on sms_consent;
create trigger trg_sms_consent_updated
  before update on sms_consent
  for each row execute function set_updated_at();

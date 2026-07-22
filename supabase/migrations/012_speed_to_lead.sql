-- Z and Z OS · Speed-to-lead instrumentation
--
-- Three things, all consequences of dropping HubSpot and of wanting to
-- measure how fast leads actually get worked:
--
--   1. jobs gains response-time columns + an escalation counter, and a trigger
--      that stamps first contact the moment a job stops being 'new'.
--   2. review_requests becomes first-party. It was keyed on hubspot_deal_id
--      (NOT NULL), so with HubSpot gone nothing could create a row and the
--      review engine had no trigger at all.
--   3. sms_consent becomes first-party too. It was HubSpot-shaped and no code
--      path wrote to it, which left no A2P consent evidence of our own.

set search_path = public;

-- ──────────────────────────────────────────────────────────────────────────
-- 1. Response-time instrumentation on jobs
-- ──────────────────────────────────────────────────────────────────────────

alter table jobs add column if not exists first_contact_at      timestamptz;
alter table jobs add column if not exists first_response_seconds int;
alter table jobs add column if not exists sla_alert_level        smallint not null default 0;
alter table jobs add column if not exists last_sla_alert_at      timestamptz;

comment on column jobs.first_contact_at is
  'When the job first left status=new. Stamped by trigger, never by hand.';
comment on column jobs.first_response_seconds is
  'first_contact_at - created_at, in seconds. The speed-to-lead metric.';
comment on column jobs.sla_alert_level is
  'How many escalation rungs have fired for this job. Keeps the cron idempotent.';

-- Open leads awaiting first contact — the escalation cron reads this.
create index if not exists jobs_awaiting_contact
  on jobs (created_at)
  where status = 'new' and first_contact_at is null;

-- Response-time reporting.
create index if not exists jobs_first_response
  on jobs (first_contact_at)
  where first_response_seconds is not null;

-- Stamp first contact when a job leaves 'new'.
--
-- A trigger rather than app code because there are several mutation paths
-- (status route, schedule route, the field PWA) and a missed one would
-- silently corrupt the metric. 'cancelled' is deliberately excluded: dropping
-- a junk lead is not a customer contact and should not flatter the average.
create or replace function stamp_job_first_contact()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'new'
     and new.status <> 'new'
     and new.status <> 'cancelled'
     and new.first_contact_at is null
  then
    new.first_contact_at := now();
    new.first_response_seconds :=
      greatest(0, extract(epoch from (now() - coalesce(old.created_at, now())))::int);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_jobs_first_contact on jobs;
create trigger trg_jobs_first_contact
  before update on jobs
  for each row
  execute function stamp_job_first_contact();

-- ──────────────────────────────────────────────────────────────────────────
-- 2. review_requests: first-party, keyed on our own jobs
-- ──────────────────────────────────────────────────────────────────────────

alter table review_requests alter column hubspot_deal_id drop not null;

alter table review_requests
  add column if not exists job_id      bigint references jobs(id) on delete cascade;
alter table review_requests
  add column if not exists customer_id bigint references customers(id);

-- One review request per job.
create unique index if not exists review_requests_job
  on review_requests (job_id)
  where job_id is not null;

comment on column review_requests.hubspot_deal_id is
  'Legacy. HubSpot is no longer wired; new rows are keyed on job_id.';

-- ──────────────────────────────────────────────────────────────────────────
-- 3. sms_consent: first-party consent ledger (A2P 10DLC evidence)
-- ──────────────────────────────────────────────────────────────────────────

alter table sms_consent
  add column if not exists customer_id bigint references customers(id);
alter table sms_consent
  add column if not exists job_id      bigint references jobs(id);

-- The ledger upserts by phone, so the phone has to be unique. Collapse any
-- pre-existing duplicates onto the most recent row before adding the
-- constraint, otherwise the index creation fails on a dirty table.
delete from sms_consent a
  using sms_consent b
 where a.phone_e164 = b.phone_e164
   and a.id < b.id;

create unique index if not exists sms_consent_phone_unique
  on sms_consent (phone_e164);

comment on column sms_consent.consent_source is
  'web_form | verbal | admin_manual. Evidence of how consent was captured.';

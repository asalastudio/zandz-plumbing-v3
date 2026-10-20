-- ============================================================================
-- 016 · Security hardening (2026-10-20 audit)
--
-- 1. Row Level Security on the eight tables that were created without it.
--    The app only ever talks to Supabase with the service-role key, which
--    bypasses RLS, so this changes nothing for the OS. It closes the REST API
--    to anyone holding the anon / publishable key, which by Supabase's default
--    grants could otherwise read and write these tables (ServiceTitan invoice
--    history with customer names, estimates, and knowledge_docs, which is fed
--    straight into the assistant's system prompt).
--
-- 2. Foreign keys that blocked deleting jobs and invoices. Every web lead
--    writes sms_consent.job_id, and estimates point at jobs and at the invoice
--    they converted into, all without ON DELETE. Deleting a spam lead failed.
--    The consent row itself must survive (it is A2P evidence), so these become
--    ON DELETE SET NULL.
--
-- 3. login_attempts: a shared ledger for the admin login throttle. The old
--    throttle lived in memory, so each serverless instance kept its own count.
--
-- Safe to re-run.
-- ============================================================================

-- ── 1. RLS ──────────────────────────────────────────────────────────────────
alter table invoice_history          enable row level security;
alter table invoice_history_archive  enable row level security;
alter table service_catalog          enable row level security;
alter table materials                enable row level security;
alter table service_materials        enable row level security;
alter table knowledge_docs           enable row level security;
alter table estimates                enable row level security;
alter table api_usage                enable row level security;

-- No policies are added on purpose: only the service role should touch these.
revoke all on table
  invoice_history, invoice_history_archive, service_catalog, materials,
  service_materials, knowledge_docs, estimates, api_usage
from anon, authenticated;

-- ── 2. Foreign keys → ON DELETE SET NULL ───────────────────────────────────
-- Drop whatever the existing constraints are called, then recreate them.
do $$
declare
  r record;
begin
  for r in
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
    where con.contype = 'f'
      and ns.nspname = 'public'
      and (
        (rel.relname = 'sms_consent' and att.attname = 'job_id')
        or (rel.relname = 'estimates' and att.attname in ('job_id', 'converted_invoice_id'))
      )
  loop
    execute format('alter table %I drop constraint %I', r.relname, r.conname);
  end loop;
end $$;

alter table sms_consent
  add constraint sms_consent_job_id_fkey
  foreign key (job_id) references jobs (id) on delete set null;

alter table estimates
  add constraint estimates_job_id_fkey
  foreign key (job_id) references jobs (id) on delete set null;

alter table estimates
  add constraint estimates_converted_invoice_id_fkey
  foreign key (converted_invoice_id) references invoices (id) on delete set null;

-- ── 3. Login attempt ledger ────────────────────────────────────────────────
create table if not exists login_attempts (
  id            bigint generated always as identity primary key,
  ip            text        not null,
  succeeded     boolean     not null default false,
  attempted_at  timestamptz not null default now()
);

create index if not exists login_attempts_ip_time on login_attempts (ip, attempted_at desc);
create index if not exists login_attempts_time    on login_attempts (attempted_at desc);

alter table login_attempts enable row level security;
revoke all on table login_attempts from anon, authenticated;

comment on table login_attempts is
  'Admin login attempts, used by /api/admin/login to throttle guessing across all serverless instances. Rows older than a day are pruned by the route.';

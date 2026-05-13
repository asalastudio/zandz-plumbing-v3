-- Z and Z OS · ServiceTitan active-job import support
-- Adds a stable foreign reference back to ServiceTitan's Job ID so the
-- import script can upsert and re-runs stay idempotent.

set search_path = public;

alter table jobs
  add column if not exists servicetitan_job_id text;

alter table jobs
  drop constraint if exists jobs_servicetitan_job_id_key;

alter table jobs
  add constraint jobs_servicetitan_job_id_key unique (servicetitan_job_id);

create index if not exists jobs_st_job_id on jobs (servicetitan_job_id);

-- Z and Z OS · Fix · ServiceTitan customer ID unique constraint
--
-- Migration 005 created a partial unique INDEX (with WHERE clause), which
-- PostgreSQL cannot use as an ON CONFLICT target via Supabase's PostgREST
-- API. Drop the partial index and replace with a regular unique CONSTRAINT.
--
-- PostgreSQL treats each NULL as distinct in unique constraints, so multiple
-- rows can still have NULL servicetitan_customer_id (the original goal of
-- the partial index).

set search_path = public;

drop index if exists customers_st_id_unique;

alter table customers
  drop constraint if exists customers_servicetitan_customer_id_key;

alter table customers
  add constraint customers_servicetitan_customer_id_key
  unique (servicetitan_customer_id);

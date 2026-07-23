-- Z and Z OS · Pricebook description review queue
--
-- Only 5 of 149 active services carry a real scope of work; the rest are the
-- service name repeated or a single line. The invoice/estimate PDF and Lisa's
-- "what's involved" answers are only as good as this field, so the gap is worth
-- closing — but a generated scope of work is a customer-facing legal-ish
-- statement, and a wrong bullet is a dispute. So generated text lands in a
-- DRAFT column and a human promotes it; the live `description` never changes
-- until someone approves.

set search_path = public;

-- The AI-drafted candidate. Never shown to a customer.
alter table service_catalog add column if not exists description_draft text;

-- Where each service sits in the review workflow.
--   'original' — untouched import; the live description is the name/one-liner
--   'pending'  — a draft exists and is waiting for a human
--   'approved' — a human accepted the draft; it was promoted to `description`
alter table service_catalog
  add column if not exists description_status text not null default 'original';

alter table service_catalog add column if not exists description_reviewed_at timestamptz;

-- The review queue reads this: everything awaiting a human, newest drafts first.
create index if not exists service_catalog_desc_status
  on service_catalog (description_status);

comment on column service_catalog.description_draft is
  'AI-generated scope of work awaiting review. Promoted into description on approval, never used directly.';
comment on column service_catalog.description_status is
  'original | pending | approved. Gates whether generated text has cleared human review.';

-- The 5 services that already shipped with a real multiline scope (the water
-- heaters) are effectively already reviewed content — mark them approved so the
-- queue does not ask anyone to re-check what ServiceTitan already wrote well.
update service_catalog
   set description_status = 'approved',
       description_reviewed_at = now()
 where description is not null
   and position(chr(10) in description) > 0
   and description_status = 'original';

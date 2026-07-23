-- Z and Z OS · API usage + cost ledger
--
-- The operator wanted one place to see what the platform's AI is costing each
-- month. This records every metered model call (the AI assistant, pricebook
-- draft generation) with its token counts and an estimated cost, so the
-- analytics page can total spend by provider. ElevenLabs voice minutes are read
-- live from their API rather than stored here.

set search_path = public;

create table if not exists api_usage (
  id             bigserial primary key,
  provider       text not null,          -- 'ai_gateway', 'elevenlabs', ...
  model          text,                   -- e.g. 'anthropic/claude-sonnet-4-6'
  operation      text,                   -- 'assistant_chat', 'pricebook_draft', ...
  input_tokens   integer default 0,
  output_tokens  integer default 0,
  -- Estimated cost in micro-dollars (millionths of a dollar) to keep token-rate
  -- math exact without floats. $0.01 = 10000.
  cost_micros    bigint default 0,
  created_at     timestamptz default now()
);

-- The panel groups by provider over the current month.
create index if not exists api_usage_created on api_usage (created_at);
create index if not exists api_usage_provider on api_usage (provider, created_at);

comment on column api_usage.cost_micros is
  'Estimated cost in micro-dollars (1e-6 USD). Computed from tokens x model rate at write time.';

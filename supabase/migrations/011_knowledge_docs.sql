-- Z and Z OS · Assistant knowledge docs
-- Company-specific knowledge the database doesn't hold (policies, warranty
-- terms, pricing rules, the operator SOP). Active docs are injected into the
-- AI assistant's system prompt.

set search_path = public;

create table if not exists knowledge_docs (
  id          bigserial primary key,
  title       text not null,
  body        text not null,
  category    text,
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists knowledge_docs_active on knowledge_docs (active);

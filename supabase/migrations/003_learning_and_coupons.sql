-- Z and Z OS · Phase 3 · Learning resources + coupons
-- Adds the two content tables Jay + Seif manage from the admin dashboard
-- and the marketing site reads from for /videos/ and /coupons/.

set search_path = public;

-- ──────────────────────────────────────────────────────────────────────────
-- Learning resources (videos + images for the public learning page)
-- ──────────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'learning_media_type') then
    create type learning_media_type as enum ('video', 'image');
  end if;
end$$;

create table if not exists learning_resources (
  id              bigserial primary key,
  media_type      learning_media_type not null default 'video',
  title           text not null,
  slug            text unique not null,
  description     text,
  category        text not null default 'general',     -- 'sewer-and-drain', 'water-heater', etc.
  url             text not null,                         -- YouTube link, image URL, etc.
  thumbnail_url   text,                                  -- optional preview image
  duration_sec    int,                                   -- optional, videos only
  sort_order      int default 0,
  published       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists learning_resources_published
  on learning_resources (published, sort_order, created_at desc);

create index if not exists learning_resources_category
  on learning_resources (category, published);

-- ──────────────────────────────────────────────────────────────────────────
-- Coupons (max 3 published, enforced by app + a partial-unique nudge)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists coupons (
  id              bigserial primary key,
  headline        text not null,                       -- "$50 Off Any Service"
  subheadline     text,                                 -- "Sewer lateral, water heater, repipe"
  terms           text,                                 -- legal terms / restrictions
  code            text,                                  -- optional promo code
  image_url       text,                                  -- optional, for richer card art
  valid_from      timestamptz,
  valid_until     timestamptz,
  display_order   int default 0,
  published       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists coupons_published
  on coupons (published, display_order, created_at desc);

-- ──────────────────────────────────────────────────────────────────────────
-- RLS lockdown
-- ──────────────────────────────────────────────────────────────────────────
alter table learning_resources enable row level security;
alter table coupons enable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- updated_at triggers
-- ──────────────────────────────────────────────────────────────────────────
drop trigger if exists trg_learning_updated on learning_resources;
create trigger trg_learning_updated
  before update on learning_resources
  for each row execute function set_updated_at();

drop trigger if exists trg_coupons_updated on coupons;
create trigger trg_coupons_updated
  before update on coupons
  for each row execute function set_updated_at();

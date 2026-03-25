-- ============================================================
--  TIPEROUS — Initial Schema
--  Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";  -- for geolocation

-- ─── PROFILES ────────────────────────────────────────────────
-- Extends Supabase auth.users automatically via trigger
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── COMPANIES ───────────────────────────────────────────────
create table public.companies (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  category        text not null default 'General',
  description     text,
  address         text,
  city            text,
  country         text,
  website         text,
  phone           text,
  -- Google Places integration
  google_place_id text unique,
  google_data     jsonb,         -- full Places API response cached
  -- Geolocation (PostGIS point)
  location        geography(Point, 4326),
  lat             double precision,
  lng             double precision,
  -- Computed scores (updated by trigger)
  score_total     integer default 0,
  score_service   integer default 0,
  score_product   integer default 0,
  score_employee  integer default 0,
  tips_count      integer default 0,
  -- Meta
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index companies_location_idx on public.companies using gist(location);
create index companies_category_idx on public.companies(category);
create index companies_score_idx    on public.companies(score_total desc);
create index companies_place_idx    on public.companies(google_place_id);

-- ─── TIPS ────────────────────────────────────────────────────
create table public.tips (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  -- Content
  type         text not null check (type in ('good', 'bad')),
  segment      text not null check (segment in ('service', 'product', 'employee')),
  text         text not null check (length(text) between 3 and 500),
  -- Engagement
  likes        integer default 0,
  -- Meta
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  -- Prevent duplicate tips from same user on same company+segment within 24h
  constraint no_spam unique nulls not distinct (company_id, user_id, segment, type, (created_at::date))
);

create index tips_company_idx  on public.tips(company_id, created_at desc);
create index tips_user_idx     on public.tips(user_id, created_at desc);
create index tips_type_idx     on public.tips(type, segment);

-- ─── TIP LIKES ───────────────────────────────────────────────
create table public.tip_likes (
  tip_id     uuid references public.tips(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (tip_id, user_id)
);

-- ─── TRIGGERS ────────────────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), '\s+', '_', 'g'))
      || '_' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Recompute company scores after tip insert/delete/update
create or replace function public.update_company_scores()
returns trigger language plpgsql as $$
declare
  cid uuid;
begin
  cid := coalesce(new.company_id, old.company_id);
  update public.companies set
    score_total    = coalesce((select sum(case when type='good' then 1 else -1 end) from public.tips where company_id = cid), 0),
    score_service  = coalesce((select sum(case when type='good' then 1 else -1 end) from public.tips where company_id = cid and segment='service'), 0),
    score_product  = coalesce((select sum(case when type='good' then 1 else -1 end) from public.tips where company_id = cid and segment='product'), 0),
    score_employee = coalesce((select sum(case when type='good' then 1 else -1 end) from public.tips where company_id = cid and segment='employee'), 0),
    tips_count     = (select count(*) from public.tips where company_id = cid),
    updated_at     = now()
  where id = cid;
  return coalesce(new, old);
end;
$$;

create trigger tips_score_update
  after insert or update or delete on public.tips
  for each row execute procedure public.update_company_scores();

-- Update tip likes counter
create or replace function public.update_tip_likes()
returns trigger language plpgsql as $$
begin
  update public.tips set
    likes = (select count(*) from public.tip_likes where tip_id = coalesce(new.tip_id, old.tip_id))
  where id = coalesce(new.tip_id, old.tip_id);
  return coalesce(new, old);
end;
$$;

create trigger tip_likes_update
  after insert or delete on public.tip_likes
  for each row execute procedure public.update_tip_likes();

-- updated_at timestamps
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger touch_companies before update on public.companies for each row execute procedure public.touch_updated_at();
create trigger touch_tips      before update on public.tips      for each row execute procedure public.touch_updated_at();
create trigger touch_profiles  before update on public.profiles  for each row execute procedure public.touch_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.companies enable row level security;
alter table public.tips      enable row level security;
alter table public.tip_likes enable row level security;

-- Profiles: anyone can read, owner can update
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Companies: anyone can read, authenticated users can insert
create policy "companies_select" on public.companies for select using (true);
create policy "companies_insert" on public.companies for insert with check (auth.uid() is not null);
create policy "companies_update" on public.companies for update using (auth.uid() = created_by);

-- Tips: anyone can read, authenticated users can insert their own
create policy "tips_select" on public.tips for select using (true);
create policy "tips_insert" on public.tips for insert with check (auth.uid() = user_id);
create policy "tips_delete" on public.tips for delete using (auth.uid() = user_id);

-- Tip likes
create policy "likes_select" on public.tip_likes for select using (true);
create policy "likes_insert" on public.tip_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.tip_likes for delete using (auth.uid() = user_id);

-- ─── REALTIME ────────────────────────────────────────────────
-- Enable realtime for tips and companies (run in Supabase dashboard too)
alter publication supabase_realtime add table public.tips;
alter publication supabase_realtime add table public.companies;

-- ─── SEED DATA ───────────────────────────────────────────────
-- Optional: uncomment to seed test companies (no auth needed for companies)
/*
insert into public.companies (name, category, city, country, score_total) values
  ('Apple Store',       'Technology', 'Buenos Aires', 'AR', 0),
  ('Starbucks Coffee',  'Food',       'Buenos Aires', 'AR', 0),
  ('Nike',              'Retail',     'Buenos Aires', 'AR', 0),
  ('Domino''s Pizza',   'Food',       'Buenos Aires', 'AR', 0);
*/

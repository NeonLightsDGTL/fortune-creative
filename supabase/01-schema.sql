-- Fortune Creative: database schema
-- Run this in Supabase SQL Editor (or via psql)

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  image_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Carousel slides (home page)
create table carousel_slides (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  caption text,
  url text,
  image_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Tags for releases and coverage
create table tags (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('release', 'coverage')),
  name text not null,
  unique (kind, name)
);

-- Press releases
create table releases (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  headline text not null,
  release_date date not null default current_date,
  tag_id uuid references tags(id) on delete set null,
  thumbnail_path text,
  blurb text check (char_length(blurb) <= 240),
  body text,
  include_contact_block boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coverage (external press articles)
create table coverage (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  outlet text not null,
  url text not null,
  published_date date not null default current_date,
  tag_id uuid references tags(id) on delete set null,
  thumbnail_path text,
  blurb text check (char_length(blurb) <= 240),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- About page (singleton row)
create table about (
  id int primary key default 1 check (id = 1),
  photo_path text,
  photo_credit text,
  bio text,
  updated_at timestamptz not null default now()
);

-- Signup log (backup only; Dan works from the emails)
create table signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at on releases, coverage, about
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger releases_updated_at
  before update on releases
  for each row execute function update_updated_at();

create trigger coverage_updated_at
  before update on coverage
  for each row execute function update_updated_at();

create trigger about_updated_at
  before update on about
  for each row execute function update_updated_at();

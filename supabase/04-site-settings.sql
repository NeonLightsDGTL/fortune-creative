-- Site settings (singleton row, like about)
-- Run this in Supabase SQL Editor

create table site_settings (
  id int primary key default 1 check (id = 1),
  tagline text not null default 'A press agency for artists, productions, and organizations across Broadway and music.',
  updated_at timestamptz not null default now()
);

-- Seed the row
insert into site_settings (id) values (1);

-- Auto-update updated_at
create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

-- RLS
alter table site_settings enable row level security;

create policy "Anyone can read site_settings"
  on site_settings for select using (true);

create policy "Authenticated users can update site_settings"
  on site_settings for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert site_settings"
  on site_settings for insert to authenticated with check (true);

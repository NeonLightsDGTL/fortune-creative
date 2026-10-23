-- Fortune Creative: RLS policies and storage buckets
-- Run this in Supabase SQL Editor AFTER 01-schema.sql

-- Enable RLS on all tables
alter table clients enable row level security;
alter table carousel_slides enable row level security;
alter table tags enable row level security;
alter table releases enable row level security;
alter table coverage enable row level security;
alter table about enable row level security;
alter table signups enable row level security;

-- Public read policies
create policy "Anyone can read clients"
  on clients for select using (true);

create policy "Anyone can read carousel_slides"
  on carousel_slides for select using (true);

create policy "Anyone can read tags"
  on tags for select using (true);

create policy "Anyone can read published releases"
  on releases for select using (status = 'published');

create policy "Anyone can read published coverage"
  on coverage for select using (status = 'published');

create policy "Anyone can read about"
  on about for select using (true);

-- Authenticated write policies (admin)
create policy "Authenticated users can read all releases"
  on releases for select to authenticated using (true);

create policy "Authenticated users can insert releases"
  on releases for insert to authenticated with check (true);

create policy "Authenticated users can update releases"
  on releases for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete releases"
  on releases for delete to authenticated using (true);

create policy "Authenticated users can read all coverage"
  on coverage for select to authenticated using (true);

create policy "Authenticated users can insert coverage"
  on coverage for insert to authenticated with check (true);

create policy "Authenticated users can update coverage"
  on coverage for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete coverage"
  on coverage for delete to authenticated using (true);

create policy "Authenticated users can insert clients"
  on clients for insert to authenticated with check (true);

create policy "Authenticated users can update clients"
  on clients for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete clients"
  on clients for delete to authenticated using (true);

create policy "Authenticated users can insert carousel_slides"
  on carousel_slides for insert to authenticated with check (true);

create policy "Authenticated users can update carousel_slides"
  on carousel_slides for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete carousel_slides"
  on carousel_slides for delete to authenticated using (true);

create policy "Authenticated users can insert tags"
  on tags for insert to authenticated with check (true);

create policy "Authenticated users can update tags"
  on tags for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete tags"
  on tags for delete to authenticated using (true);

create policy "Authenticated users can update about"
  on about for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert about"
  on about for insert to authenticated with check (true);

-- Signups: only service role can insert (server action)
create policy "Service role can insert signups"
  on signups for insert to service_role with check (true);

create policy "Authenticated users can read signups"
  on signups for select to authenticated using (true);

-- Storage buckets (public read)
insert into storage.buckets (id, name, public)
values
  ('clients', 'clients', true),
  ('carousel', 'carousel', true),
  ('releases', 'releases', true),
  ('coverage', 'coverage', true),
  ('about', 'about', true)
on conflict (id) do nothing;

-- Storage policies: anyone can read, authenticated can upload/update/delete
create policy "Public read for clients bucket"
  on storage.objects for select using (bucket_id = 'clients');

create policy "Auth upload to clients bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'clients');

create policy "Auth update in clients bucket"
  on storage.objects for update to authenticated using (bucket_id = 'clients');

create policy "Auth delete from clients bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'clients');

create policy "Public read for carousel bucket"
  on storage.objects for select using (bucket_id = 'carousel');

create policy "Auth upload to carousel bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'carousel');

create policy "Auth update in carousel bucket"
  on storage.objects for update to authenticated using (bucket_id = 'carousel');

create policy "Auth delete from carousel bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'carousel');

create policy "Public read for releases bucket"
  on storage.objects for select using (bucket_id = 'releases');

create policy "Auth upload to releases bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'releases');

create policy "Auth update in releases bucket"
  on storage.objects for update to authenticated using (bucket_id = 'releases');

create policy "Auth delete from releases bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'releases');

create policy "Public read for coverage bucket"
  on storage.objects for select using (bucket_id = 'coverage');

create policy "Auth upload to coverage bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'coverage');

create policy "Auth update in coverage bucket"
  on storage.objects for update to authenticated using (bucket_id = 'coverage');

create policy "Auth delete from coverage bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'coverage');

create policy "Public read for about bucket"
  on storage.objects for select using (bucket_id = 'about');

create policy "Auth upload to about bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'about');

create policy "Auth update in about bucket"
  on storage.objects for update to authenticated using (bucket_id = 'about');

create policy "Auth delete from about bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'about');

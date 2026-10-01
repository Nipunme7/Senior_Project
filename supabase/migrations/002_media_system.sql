-- Phase 6 — Media system storage policies
-- Run in Supabase SQL Editor after 001_supabase_foundation.sql
--
-- Aligns object paths with architecture:
--   site-media/{site_id}/{filename}
-- and allows public read so published sites can render media URLs.

-- Drop Phase 5 owner-id folder policies (replaced below).
drop policy if exists "site_media_select_own" on storage.objects;
drop policy if exists "site_media_insert_own" on storage.objects;
drop policy if exists "site_media_update_own" on storage.objects;
drop policy if exists "site_media_delete_own" on storage.objects;

-- Public read for rendered published websites (MVP).
drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read"
on storage.objects for select
to public
using (bucket_id = 'site-media');

-- Owners can manage objects under folders named with their site UUID.
drop policy if exists "site_media_insert_own_site" on storage.objects;
create policy "site_media_insert_own_site"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.sites s
    where s.id::text = (storage.foldername(name))[1]
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "site_media_update_own_site" on storage.objects;
create policy "site_media_update_own_site"
on storage.objects for update
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.sites s
    where s.id::text = (storage.foldername(name))[1]
      and s.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.sites s
    where s.id::text = (storage.foldername(name))[1]
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "site_media_delete_own_site" on storage.objects;
create policy "site_media_delete_own_site"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.sites s
    where s.id::text = (storage.foldername(name))[1]
      and s.owner_id = auth.uid()
  )
);

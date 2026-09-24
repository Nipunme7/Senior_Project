-- Phase 5 — Supabase foundation
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sites
-- ---------------------------------------------------------------------------
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  business_name text not null,
  slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  style text,
  site_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sites_slug_unique unique (slug)
);

create index if not exists sites_owner_id_idx on public.sites (owner_id);
create index if not exists sites_status_idx on public.sites (status);

-- ---------------------------------------------------------------------------
-- media (metadata only; uploads come in Phase 6)
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  storage_path text not null,
  type text not null check (type in ('image', 'video')),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists media_site_id_idx on public.media (site_id);

-- ---------------------------------------------------------------------------
-- site_versions (history foundation; rollback comes later)
-- ---------------------------------------------------------------------------
create table if not exists public.site_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  version_number integer not null,
  config jsonb not null,
  created_at timestamptz not null default now(),
  constraint site_versions_site_version_unique unique (site_id, version_number)
);

create index if not exists site_versions_site_id_idx on public.site_versions (site_id);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sites_set_updated_at on public.sites;
create trigger sites_set_updated_at
before update on public.sites
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.media enable row level security;
alter table public.site_versions enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- sites
drop policy if exists "sites_select_published" on public.sites;
create policy "sites_select_published"
on public.sites for select
to anon, authenticated
using (status = 'published');

drop policy if exists "sites_select_own" on public.sites;
create policy "sites_select_own"
on public.sites for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "sites_insert_own" on public.sites;
create policy "sites_insert_own"
on public.sites for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "sites_update_own" on public.sites;
create policy "sites_update_own"
on public.sites for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "sites_delete_own" on public.sites;
create policy "sites_delete_own"
on public.sites for delete
to authenticated
using (auth.uid() = owner_id);

-- media
drop policy if exists "media_select_published_site" on public.media;
create policy "media_select_published_site"
on public.media for select
to anon, authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.id = media.site_id
      and s.status = 'published'
  )
);

drop policy if exists "media_select_own" on public.media;
create policy "media_select_own"
on public.media for select
to authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.id = media.site_id
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "media_insert_own" on public.media;
create policy "media_insert_own"
on public.media for insert
to authenticated
with check (
  exists (
    select 1
    from public.sites s
    where s.id = media.site_id
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "media_update_own" on public.media;
create policy "media_update_own"
on public.media for update
to authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.id = media.site_id
      and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.sites s
    where s.id = media.site_id
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "media_delete_own" on public.media;
create policy "media_delete_own"
on public.media for delete
to authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.id = media.site_id
      and s.owner_id = auth.uid()
  )
);

-- site_versions
drop policy if exists "site_versions_select_own" on public.site_versions;
create policy "site_versions_select_own"
on public.site_versions for select
to authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.id = site_versions.site_id
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "site_versions_insert_own" on public.site_versions;
create policy "site_versions_insert_own"
on public.site_versions for insert
to authenticated
with check (
  exists (
    select 1
    from public.sites s
    where s.id = site_versions.site_id
      and s.owner_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Storage foundation (uploads come in Phase 6)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', false)
on conflict (id) do nothing;

drop policy if exists "site_media_select_own" on storage.objects;
create policy "site_media_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'site-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "site_media_insert_own" on storage.objects;
create policy "site_media_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "site_media_update_own" on storage.objects;
create policy "site_media_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'site-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'site-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "site_media_delete_own" on storage.objects;
create policy "site_media_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

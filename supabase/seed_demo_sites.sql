-- Optional Phase 5 seed (run only after creating an Auth user)
--
-- Steps:
-- 1. Supabase → Authentication → Users → Add user
-- 2. Copy the user's UUID
-- 3. Replace every YOUR_USER_UUID below
-- 4. Replace each site_config value with the full JSON from:
--      frontend/lib/demo/elite-cuts-config.ts
--      frontend/lib/demo/everest-coffee-config.ts
--    (export the object as JSON; do not leave sections empty)
-- 5. Run in SQL Editor
--
-- Until seeded, /site/barber and /site/cafe still use local demo configs.

insert into public.profiles (id, display_name)
values ('YOUR_USER_UUID', 'Demo Owner')
on conflict (id) do nothing;

-- Example insert — replace site_config with full WebsiteConfig JSON before relying on DB reads.
-- insert into public.sites (owner_id, business_name, slug, status, style, site_config)
-- values
--   ('YOUR_USER_UUID', 'Elite Cuts', 'barber', 'published', 'luxury', '{}'::jsonb),
--   ('YOUR_USER_UUID', 'Everest Coffee', 'cafe', 'published', 'minimal', '{}'::jsonb)
-- on conflict (slug) do update
-- set business_name = excluded.business_name,
--     status = excluded.status,
--     style = excluded.style,
--     site_config = excluded.site_config,
--     updated_at = now();

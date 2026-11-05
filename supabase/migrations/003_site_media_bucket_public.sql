-- Phase 6 fix — site-media must be a public bucket for /object/public/ URLs.
-- The renderer builds public Storage URLs; a private bucket returns broken images.
-- Safe to re-run.

update storage.buckets
set public = true
where id = 'site-media';

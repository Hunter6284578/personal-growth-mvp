BEGIN;

-- Public interaction content is intentionally removed for the site's audit scope.
-- No backup or export is created; applying this migration permanently deletes all rows.
DROP TABLE IF EXISTS public.blog_comments;
DROP TABLE IF EXISTS public.guestbook_entries;

COMMIT;

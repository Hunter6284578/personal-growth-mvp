# Remove Public Interaction Features

## Context

The public site currently supports three visitor-submitted interactions:

- comments beneath blog posts;
- guestbook messages;
- visitor check-ins.

These features use Supabase tables, public submission policies, public display pages, and owner-only management pages. The site is being prepared for an audit whose requirements differ depending on whether public comments or similar user-generated content are accepted. All three interaction types must therefore be removed from the local project, the deployed website, and the production Supabase database.

The removal is intentionally destructive. Existing comments, guestbook messages, and check-ins will not be exported or retained.

## Goals

- Remove every public interface that displays or accepts comments, guestbook messages, or check-ins.
- Remove every dashboard interface used to manage those records.
- Remove application queries, mutations, types, styles, navigation links, and documentation that advertise or depend on these features.
- Permanently delete the production `blog_comments` and `guestbook_entries` tables and their contents.
- Preserve blog posts, blog authoring, authentication, page-view counting, and optional Umami analytics.
- Preserve all unrelated uncommitted work already present in the checkout.

## Non-goals

- Do not alter blog posts or the `blog_posts` table.
- Do not remove page-view counting or analytics.
- Do not change login, administrator membership, image storage, or authoring workflows.
- Do not refactor unrelated UI or backend code.
- Do not retain an offline export of visitor-submitted content.

## Application Changes

### Public site

The blog article route will stop loading comments and will render no comment list or submission form. The public guestbook route will be removed, so `/guestbook` resolves through the application's normal not-found behavior. All guestbook, comment, and check-in links and descriptive copy will be removed from navigation, footer, registration messaging, and project documentation.

### Dashboard

The comment and guestbook management routes and their components will be removed. `/dashboard/comments` and `/dashboard/guestbook` will resolve through the application's normal not-found behavior. Dashboard navigation will no longer advertise either route.

### Shared code

Comment and guestbook data types, Supabase helpers, client mutations, and feature-specific styles will be removed when no longer referenced. Historical migration files will remain unchanged because they are an append-only record of previously applied schema changes.

## Database Destruction

A new forward-only Supabase migration will drop exactly these tables:

- `public.blog_comments`;
- `public.guestbook_entries`.

The migration will use `DROP TABLE IF EXISTS` so it is safe to apply once even if one table is already absent. Dropping each table also removes its rows, indexes, triggers, and row-level security policies. No backup or export will be created, matching the approved permanent-deletion requirement.

Previously applied migration files that created or modified these tables will remain in the repository. On a fresh database, migrations run in order and the final removal migration leaves both tables absent.

## Deployment Sequence

1. Record the current deployed application and database state with read-only checks.
2. Run local static checks, lint, build, and rendered workflow checks.
3. Deploy the application version that no longer queries or links to the two tables.
4. Confirm the deployed article pages work and all removed routes are unavailable.
5. Apply the production Supabase removal migration immediately after the application deployment.
6. Verify both tables are absent and that unaffected blog and analytics behavior still works.

Deploying the application before dropping the tables avoids a window in which the old live article page queries a missing table. The short interval before the migration does not expose a submission interface because the newly deployed application has already removed it.

## Failure Handling

- If local lint, build, or browser checks fail, stop before deploying.
- If application deployment fails, do not run the destructive database migration.
- If the new application does not pass online checks, restore the previously deployed application artifact before changing the database.
- After the database migration succeeds, deleted visitor content is intentionally unrecoverable. A later application rollback must therefore use a version that does not require the removed tables, or re-create empty tables through a new migration.
- Credentials and database connection strings must not be printed in logs or committed.

## Verification

Local verification must demonstrate:

- lint succeeds;
- the production build succeeds;
- repository searches find no active application references to comments, guestbook messages, or check-ins;
- a rendered blog article has no comment display or submission controls;
- removed public and dashboard routes return not found;
- existing unrelated working-tree changes remain present.

Production verification must demonstrate:

- the home page, blog index, and at least one published article load normally;
- the article contains no comment display or submission controls;
- `/guestbook`, `/dashboard/comments`, and `/dashboard/guestbook` are unavailable;
- dashboard navigation contains no comment or guestbook entry;
- `public.blog_comments` and `public.guestbook_entries` no longer exist;
- blog posts and their authoring data remain intact;
- page-view counting and configured analytics remain in place.

## Acceptance Criteria

The change is complete only when no visitor can submit, view, or manage comments, guestbook messages, or check-ins through the website or Supabase API; both production tables and their historical rows are deleted; unaffected blog and analytics workflows pass verification; and no unrelated local changes were overwritten.

# Remove Public Interaction Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permanently remove blog comments, guestbook messages, and visitor check-ins from the application, deployed website, and production Supabase database without disturbing blog publishing, page views, analytics, or unrelated local work.

**Architecture:** Remove all active application consumers first, then deploy and verify the non-interactive build before applying a forward-only migration that drops the two visitor-content tables. Historical migrations remain unchanged; `009_remove_public_interactions.sql` is the final schema state. The database step runs only after the new application is healthy online.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase PostgreSQL/RLS, PowerShell, SSH/PM2/Nginx, browser-based Supabase SQL Editor.

## Global Constraints

- Permanently delete `public.blog_comments`, `public.guestbook_entries`, and every row in them; create no export or backup of visitor content.
- Preserve `public.blog_posts`, blog authoring, authentication, page-view counting, and optional Umami analytics.
- Preserve all unrelated tracked and untracked working-tree changes.
- Do not edit historical migrations `004_owner_only_posts_and_comments.sql`, `005_add_guestbook_entries.sql`, `006_revamp_comments.sql`, or the pre-existing untracked `008_migration_fixes.sql`.
- Deploy application code before dropping database tables.
- If local verification or application deployment fails, do not execute the destructive database migration.
- Do not print or commit Supabase credentials, SSH secrets, or production environment values.

---

### Task 1: Protect the Current Checkout and Record Production Baselines

**Files:**
- Read only: all existing tracked and untracked files
- Read only: production process and HTTP state

**Interfaces:**
- Consumes: current Git checkout and the existing ECS deployment at `118.31.169.161:22222`
- Produces: a verified baseline showing which changes predate this plan and whether deployment can proceed

- [ ] **Step 1: Record the dirty-worktree baseline**

Run:

```powershell
git status --short --branch
git diff --name-only
git ls-files --others --exclude-standard
```

Expected: the existing modifications and untracked files remain visible, including the pre-existing `supabase/migrations/008_migration_fixes.sql`; no cleanup, reset, stash, or checkout operation is run.

- [ ] **Step 2: Confirm current branch and remote without changing them**

Run:

```powershell
git branch --show-current
git remote -v
git log -3 --oneline
```

Expected: branch `master`, GitHub origin `Hunter6284578/personal-growth-mvp`, and the design commit are visible.

- [ ] **Step 3: Confirm ECS access and current service health**

Run:

```powershell
ssh -p 22222 -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new root@118.31.169.161 "pm2 describe personal-growth-mvp >/dev/null && curl -fsS -o /dev/null http://127.0.0.1:3000/ && printf 'ECS_BASELINE_OK\n'"
```

Expected: `ECS_BASELINE_OK`. If SSH, PM2, or localhost HTTP fails, stop before implementation deployment and diagnose the deployment path.

- [ ] **Step 4: Record public-site HTTP baselines**

Run:

```powershell
curl.exe --noproxy "*" -sS -o NUL -w "home=%{http_code}`n" https://cagedsheep.cn/
curl.exe --noproxy "*" -sS -o NUL -w "blog=%{http_code}`n" https://cagedsheep.cn/blog
curl.exe --noproxy "*" -sS -o NUL -w "guestbook=%{http_code}`n" https://cagedsheep.cn/guestbook
```

Expected before deployment: home and blog return `200`; the guestbook result is recorded rather than assumed because its application files are already absent in the current checkout.

---

### Task 2: Remove Active Comment Rendering, Submission, and Management

**Files:**
- Modify: `src/app/(public)/blog/[slug]/page.tsx`
- Modify: `src/components/Navigation.tsx`
- Modify: `src/lib/blog.ts`
- Modify: `src/types/index.ts`
- Delete: `src/components/site/CommentsSection.tsx`
- Delete: `src/components/dashboard/CommentsManager.tsx`
- Delete: `src/app/(dashboard)/dashboard/comments/page.tsx`

**Interfaces:**
- Consumes: `getPublishedPostBySlug`, `getPublishedPosts`, `BlogPost`, and existing blog/article rendering
- Produces: article and dashboard bundles with no comment queries, mutations, UI, types, or routes

- [ ] **Step 1: Run the static regression check and verify the current code fails it**

Run:

```powershell
rg -n "CommentsSection|getApprovedComments|BlogComment|/dashboard/comments|MessageCircle" src
```

Expected: matches in the article route, navigation, blog helper, comment components, type definitions, and dashboard comments route.

- [ ] **Step 2: Remove comment loading and rendering from the article route**

In `src/app/(public)/blog/[slug]/page.tsx`, replace:

```tsx
import { getApprovedComments, getPublishedPostBySlug, getPublishedPosts } from '@/lib/blog'
import { createClient } from '@/lib/supabase-server'
import { isSiteAdmin } from '@/lib/site-admin'
import { CommentsSection } from '@/components/site/CommentsSection'
```

with:

```tsx
import { getPublishedPostBySlug, getPublishedPosts } from '@/lib/blog'
```

Delete this authentication/comment block:

```tsx
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [comments, isAdmin] = await Promise.all([
    getApprovedComments(post.id),
    isSiteAdmin(supabase, user),
  ])
```

Delete this render call:

```tsx
      <CommentsSection postId={post.id} initialComments={comments} isSiteOwner={isAdmin} />
```

Expected: the article remains a server component that loads only the post list and requested post, renders the article, view counter, and same-series links.

- [ ] **Step 3: Remove the dashboard comments navigation entry**

In `src/components/Navigation.tsx`, remove `MessageCircle` from the `lucide-react` import and replace the blog group with:

```tsx
  {
    title: '博客',
    items: [
      { href: '/dashboard/blog', label: '文章管理', icon: PenLine },
    ],
  },
```

Expected: dashboard navigation continues to expose article management and analytics, but no comment management link.

- [ ] **Step 4: Remove the comment query helper and shared visitor-content types**

In `src/lib/blog.ts`, replace:

```ts
import type { BlogComment, BlogPost } from '@/types'
```

with:

```ts
import type { BlogPost } from '@/types'
```

Delete the entire exported `getApprovedComments(postId: string)` function. In `src/types/index.ts`, keep `BlogPost` unchanged and delete the complete `BlogComment` and `GuestbookEntry` interfaces.

Expected: shared application code models only retained blog data.

- [ ] **Step 5: Delete the obsolete route and components**

Apply a patch that deletes exactly:

```text
src/components/site/CommentsSection.tsx
src/components/dashboard/CommentsManager.tsx
src/app/(dashboard)/dashboard/comments/page.tsx
```

Expected: no other route or component is deleted.

- [ ] **Step 6: Run the focused regression check**

Run:

```powershell
$matches = rg -n "CommentsSection|getApprovedComments|BlogComment|/dashboard/comments|MessageCircle" src 2>$null
if ($LASTEXITCODE -eq 0) { $matches; throw 'Active comment references remain' }
if ($LASTEXITCODE -ne 1) { throw 'rg failed unexpectedly' }
Write-Output 'ACTIVE_COMMENT_CODE_REMOVED'
npm run lint
```

Expected: `ACTIVE_COMMENT_CODE_REMOVED` and ESLint exits `0`.

- [ ] **Step 7: Commit only the focused application removal**

Run:

```powershell
git add -- 'src/app/(public)/blog/[slug]/page.tsx' 'src/components/Navigation.tsx' 'src/lib/blog.ts' 'src/types/index.ts' 'src/components/site/CommentsSection.tsx' 'src/components/dashboard/CommentsManager.tsx' 'src/app/(dashboard)/dashboard/comments/page.tsx'
git diff --cached --check
git diff --cached --name-only
git commit -m "feat: remove public interaction interfaces"
```

Expected: the cached name list contains only the seven paths above; the commit succeeds without staging pre-existing work.

---

### Task 3: Remove Obsolete Copy and Styles, and Add the Destructive Migration

**Files:**
- Modify: `src/app/register/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `README.md`
- Modify: `DEPLOYMENT_GUIDE.md`
- Create: `supabase/migrations/009_remove_public_interactions.sql`

**Interfaces:**
- Consumes: the retained blog-only site behavior from Task 2
- Produces: accurate user-facing copy and a forward-only database migration whose final schema has no visitor-content tables

- [ ] **Step 1: Verify stale copy and styles still exist**

Run:

```powershell
rg -n -i "comments-section|comment-item|guestbook-|/guestbook|/dashboard/comments|/dashboard/guestbook|评论|留言|打卡|blog_comments" src/app/globals.css src/app/register/page.tsx README.md DEPLOYMENT_GUIDE.md
```

Expected: matches identify only the obsolete feature styles and documentation/copy.

- [ ] **Step 2: Update registration copy**

In `src/app/register/page.tsx`, replace:

```tsx
              这是个人网站的站主后台，不开放公共注册。访客可以阅读文章，评论功能会走公开提交和审核流程。
```

with:

```tsx
              这是个人网站的站主后台，不开放公共注册。访客可以直接阅读公开文章。
```

- [ ] **Step 3: Remove only visitor-interaction CSS**

Delete exactly this block from `src/app/globals.css` and leave all other existing changes intact:

```css
  .comments-section {
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    max-width: 48rem;
    padding-top: 2rem;
  }

  .comment-item {
    border-bottom: 1px solid var(--border);
    padding: 1rem 0;
  }

  .comment-item:last-child {
    border-bottom: 0;
  }

  .guestbook-list {
    border-top: 1px solid var(--border);
  }

  .guestbook-entry {
    border-bottom: 1px solid var(--border);
    padding: 1.25rem 0;
  }

  .guestbook-form {
    max-width: 42rem;
    border-top: 1px solid var(--border);
    padding-top: 2rem;
  }
```

- [ ] **Step 4: Update project documentation to the retained feature set**

In `README.md`:

- remove the three route bullets for `/dashboard/comments`, `/guestbook`, and `/dashboard/guestbook`;
- change the database sentence to `核心表是 blog_posts 和 site_admins`;
- replace the content paragraph with `文章内容来自 Supabase 的 blog_posts 表，登录后在 /dashboard/blog 管理。网站不提供评论、留言或访客打卡功能。`.

In `DEPLOYMENT_GUIDE.md`:

- change the owner description to `这样只有你能进入 /dashboard、发布文章和上传图片。访客只能阅读公开文章。`;
- remove the guestbook-enablement paragraph;
- rename `## 3.1 启用留言簿与访问统计` to `## 3.1 启用访问统计` and retain only the Umami instructions.

- [ ] **Step 5: Create the forward-only destruction migration**

Create `supabase/migrations/009_remove_public_interactions.sql` with exactly:

```sql
BEGIN;

-- Public interaction content is intentionally removed for the site's audit scope.
-- No backup or export is created; applying this migration permanently deletes all rows.
DROP TABLE IF EXISTS public.blog_comments;
DROP TABLE IF EXISTS public.guestbook_entries;

COMMIT;
```

Expected: no `CASCADE` is used, so an unexpected external dependency stops the migration instead of deleting unrelated objects.

- [ ] **Step 6: Run focused cleanup and migration checks**

Run:

```powershell
$matches = rg -n -i "comments-section|comment-item|guestbook-|/guestbook|/dashboard/comments|/dashboard/guestbook|评论功能会走|文章评论、访客留言|核心表是.*blog_comments" src README.md DEPLOYMENT_GUIDE.md 2>$null
if ($LASTEXITCODE -eq 0) { $matches; throw 'Obsolete interaction copy or styles remain' }
if ($LASTEXITCODE -ne 1) { throw 'rg failed unexpectedly' }
$sql = Get-Content -Raw 'supabase/migrations/009_remove_public_interactions.sql'
if ($sql -notmatch 'DROP TABLE IF EXISTS public\.blog_comments;' -or $sql -notmatch 'DROP TABLE IF EXISTS public\.guestbook_entries;') { throw 'Removal migration is incomplete' }
if ($sql -match 'CASCADE') { throw 'Removal migration is broader than approved' }
Write-Output 'COPY_STYLES_AND_MIGRATION_OK'
npm run lint
```

Expected: `COPY_STYLES_AND_MIGRATION_OK` and ESLint exits `0`.

- [ ] **Step 7: Stage only this task's changes and commit**

Run:

```powershell
git add -- 'src/app/register/page.tsx' 'README.md' 'DEPLOYMENT_GUIDE.md' 'supabase/migrations/009_remove_public_interactions.sql'
git add -p -- 'src/app/globals.css'
git diff --cached --check
git diff --cached --name-only
git diff --cached -- 'src/app/globals.css'
```

For the interactive CSS staging, answer `y` only for the hunk deleting `.comments-section`, `.comment-item`, and `.guestbook-*`; answer `n` for the pre-existing login-page CSS addition. Expected: the cached CSS diff contains only the approved selector deletion. Then run:

```powershell
git commit -m "chore: remove interaction schema and copy"
```

Expected: the commit succeeds and the pre-existing login-page CSS addition remains unstaged in the working tree.

---

### Task 4: Verify the Local Production Build and Rendered Workflow

**Files:**
- Verify: all application files
- Verify: `.next/server/app-paths-manifest.json`

**Interfaces:**
- Consumes: Tasks 2 and 3
- Produces: a deployable standalone build with no removed routes or comment UI

- [ ] **Step 1: Invoke required implementation and verification skills**

Read and follow these skills before the checks: `design-taste-frontend`, `vercel-react-best-practices`, `vercel-composition-patterns`, `supabase-postgres-best-practices`, `web-design-guidelines`, `webapp-testing`, and `verification-before-completion`. Their checks are limited to the surfaces changed by this plan.

- [ ] **Step 2: Run a clean verification pass**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit `0`; Next.js lists retained routes and no compilation error references a deleted component, type, or helper.

- [ ] **Step 3: Verify removed routes are absent from the build manifest**

Run:

```powershell
$manifest = Get-Content -Raw '.next/server/app-paths-manifest.json'
foreach ($route in @('/guestbook/page','/dashboard/comments/page','/dashboard/guestbook/page')) {
  if ($manifest.Contains($route)) { throw "Removed route still exists: $route" }
}
Write-Output 'REMOVED_ROUTES_ABSENT'
```

Expected: `REMOVED_ROUTES_ABSENT`.

- [ ] **Step 4: Start the production server for browser verification**

Run the verified build in a reusable terminal session:

```powershell
npm run start -- -p 3001
```

Expected: Next.js reports ready on `http://localhost:3001`; keep the process running only for Task 4 browser checks.

- [ ] **Step 5: Verify rendered public pages with browser tooling**

Using the `webapp-testing` browser workflow:

- open `/`, `/blog`, and one rendered `/blog/[slug]` article;
- confirm the home page, article list, article body, view counter, and same-series area render without console errors;
- confirm the article DOM contains no text or controls for `Comments`, `读者留言`, `提交评论`, `昵称`, or comment deletion/pinning;
- open `/guestbook` and confirm the normal not-found page;
- authenticate as the existing site owner if a valid local session is available, open the dashboard, and confirm there is no comment-management navigation entry;
- inspect the built manifest as the authoritative dashboard-route check if authentication is unavailable.

Expected: retained workflows render normally and all removed interaction surfaces are absent.

- [ ] **Step 6: Stop the local verification server**

Send `Ctrl+C` to the reusable terminal session.

Expected: the Next.js server exits cleanly and no background process is left behind.

---

### Task 5: Deploy and Verify the Non-Interactive Application

**Files:**
- Execute: `deploy-tar.ps1`
- Preserve remotely: `/var/www/personal-growth-mvp/.env`, `.env.local`, `.env.production`, and logs

**Interfaces:**
- Consumes: the verified `.next/standalone` output from Task 4 and existing SSH access on port `22222`
- Produces: a healthy production deployment that no longer reads or exposes visitor-content features

- [ ] **Step 1: Re-run the deployment gate**

Run:

```powershell
npm run lint
npm run build
ssh -p 22222 -o BatchMode=yes -o ConnectTimeout=8 root@118.31.169.161 "test -f /var/www/personal-growth-mvp/.env.production && pm2 describe personal-growth-mvp >/dev/null && printf 'DEPLOY_GATE_OK\n'"
```

Expected: lint/build pass and `DEPLOY_GATE_OK`. If any check fails, stop; do not touch the production database.

- [ ] **Step 2: Deploy the standalone artifact**

Run:

```powershell
.\deploy-tar.ps1
```

Expected: artifact upload succeeds, PM2 restarts `personal-growth-mvp`, and the script reports localhost HTTP `200`. The script preserves production environment files and keeps the previous release directory for application rollback.

- [ ] **Step 3: Verify public production pages before database destruction**

Run:

```powershell
curl.exe --noproxy "*" -sS -o NUL -w "home=%{http_code}`n" https://cagedsheep.cn/
curl.exe --noproxy "*" -sS -o NUL -w "blog=%{http_code}`n" https://cagedsheep.cn/blog
curl.exe --noproxy "*" -sS -o NUL -w "guestbook=%{http_code}`n" https://cagedsheep.cn/guestbook
curl.exe --noproxy "*" -sS https://cagedsheep.cn/blog | Select-String -Pattern 'href="/blog/[^"?#]+"' | Select-Object -First 1
```

Expected: home and blog return `200`, guestbook returns `404`, and at least one article link is discoverable when published posts exist.

- [ ] **Step 4: Verify the production article visually**

Open the discovered article with browser tooling. Confirm the article renders and contains no comment display, submission, pin, delete, nickname, guestbook, or check-in control. Check browser console errors and confirm dashboard navigation has no comment-management entry when signed in.

Expected: the new application is healthy and independent of both tables. Only after this passes may Task 6 begin.

---

### Task 6: Permanently Delete Production Visitor Content and Verify the Final State

**Files:**
- Execute in Supabase SQL Editor: `supabase/migrations/009_remove_public_interactions.sql`
- Verify: production Supabase schema and public website

**Interfaces:**
- Consumes: the healthy production application from Task 5 and the explicitly approved permanent-deletion migration
- Produces: production schema without `blog_comments` or `guestbook_entries`, with `blog_posts` intact

- [ ] **Step 1: Open the production Supabase project using the existing signed-in browser session**

Use browser control to open the Supabase project referenced by `NEXT_PUBLIC_SUPABASE_URL` without displaying its key. Navigate to SQL Editor.

Expected: the correct project is open and authenticated. If authentication is unavailable, stop here and request only the login action; do not attempt an alternate destructive path with unverified credentials.

- [ ] **Step 2: Run the read-only schema and blog baseline query**

Execute:

```sql
SELECT
  to_regclass('public.blog_posts') AS blog_posts,
  to_regclass('public.blog_comments') AS blog_comments,
  to_regclass('public.guestbook_entries') AS guestbook_entries,
  (SELECT count(*) FROM public.blog_posts) AS blog_post_count;
```

Expected before deletion: `blog_posts` resolves to `blog_posts` and its count is recorded. Either visitor table may already be absent; `DROP TABLE IF EXISTS` handles that state.

- [ ] **Step 3: Execute the approved destruction migration exactly once**

Execute the contents of `supabase/migrations/009_remove_public_interactions.sql`:

```sql
BEGIN;

-- Public interaction content is intentionally removed for the site's audit scope.
-- No backup or export is created; applying this migration permanently deletes all rows.
DROP TABLE IF EXISTS public.blog_comments;
DROP TABLE IF EXISTS public.guestbook_entries;

COMMIT;
```

Expected: successful completion. If PostgreSQL reports a dependency error, the transaction rolls back; inspect the named dependency and do not add `CASCADE` without a new explicit review.

- [ ] **Step 4: Verify tables are absent and blog data is unchanged**

Execute:

```sql
SELECT
  to_regclass('public.blog_posts') AS blog_posts,
  to_regclass('public.blog_comments') AS blog_comments,
  to_regclass('public.guestbook_entries') AS guestbook_entries,
  (SELECT count(*) FROM public.blog_posts) AS blog_post_count;
```

Expected: `blog_posts` still resolves and the count matches Step 2; both visitor-content columns are `NULL`.

- [ ] **Step 5: Verify the public Supabase API cannot access removed tables**

Run locally without printing credentials:

```powershell
$envMap = @{}
Get-Content '.env.local' | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object {
  $key, $value = $_ -split '=', 2
  $envMap[$key] = $value.Trim('"')
}
$headers = @{ apikey = $envMap['NEXT_PUBLIC_SUPABASE_ANON_KEY']; Authorization = "Bearer $($envMap['NEXT_PUBLIC_SUPABASE_ANON_KEY'])" }
foreach ($table in @('blog_comments', 'guestbook_entries')) {
  try {
    Invoke-WebRequest -Uri "$($envMap['NEXT_PUBLIC_SUPABASE_URL'])/rest/v1/$table?select=id&limit=1" -Headers $headers -Method Get -ErrorAction Stop | Out-Null
    throw "Removed table remains reachable: $table"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -notin @(400,404)) { throw }
    Write-Output "$table=ABSENT"
  }
}
```

Expected: `blog_comments=ABSENT` and `guestbook_entries=ABSENT`; secret values are never emitted.

- [ ] **Step 6: Run final application and repository verification**

Run:

```powershell
npm run lint
npm run build
curl.exe --noproxy "*" -sS -o NUL -w "home=%{http_code}`n" https://cagedsheep.cn/
curl.exe --noproxy "*" -sS -o NUL -w "blog=%{http_code}`n" https://cagedsheep.cn/blog
curl.exe --noproxy "*" -sS -o NUL -w "guestbook=%{http_code}`n" https://cagedsheep.cn/guestbook
git status --short
git log -5 --oneline
```

Expected: local checks pass; home/blog return `200`; guestbook returns `404`; the two implementation commits and design/plan commits are visible; every unrelated pre-existing modification and untracked file remains present.

- [ ] **Step 7: Report the irreversible result with evidence**

Report the deployed application verification, the two `NULL` `to_regclass` results, the unchanged blog post count, and the preserved dirty-worktree inventory. State plainly that the two tables and their rows were permanently deleted and cannot be recovered from this workflow.

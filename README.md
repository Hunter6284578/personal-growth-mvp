# Personal Blog

一个基于 `Next.js + TypeScript + Tailwind CSS + Supabase` 的个人博客。当前代码只保留公开博客展示和登录后的文章管理后台。

## 功能范围

- `/`：个人博客首页
- `/about`：简短个人介绍
- `/projects`：项目记录
- `/blog`：文章列表
- `/blog/[slug]`：文章详情
- `/dashboard/blog`：登录后的文章管理
- `/dashboard/comments`：评论审核
- `/guestbook`：访客留言和每日打卡
- `/dashboard/guestbook`：留言和打卡审核
- `/login`、`/register`、`/forgot-password`、`/reset-password`：后台登录与账户恢复

## 技术栈

- `Next.js 16` App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Supabase Auth + Database + Storage`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写：

```env
NEXT_PUBLIC_SITE_URL=https://cagedsheep.cn
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REVALIDATE_TOKEN=...
SITE_OWNER_EMAIL=your@email.com
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=...
```

说明：

- `NEXT_PUBLIC_SITE_URL` 用于 sitemap、robots、RSS 和 metadata。
- `REVALIDATE_TOKEN` 用于 `/api/revalidate` 的内容主动刷新鉴权。
- `SITE_OWNER_EMAIL` 用于后台站主识别。数据库权限仍以 `site_admins` 表为准。
- Supabase Storage 需要一个公开的 `images` bucket，迁移文件会创建它。
- Umami 两项变量都配置后才会加载统计脚本；留空则不采集任何访问统计。

### 3. 初始化数据库

按顺序执行 `supabase/migrations` 下的 SQL。核心表是 `blog_posts`、`blog_comments` 和 `site_admins`，`002_drop_legacy_non_blog_tables.sql` 用来清理旧版成长/健身/AI 模块留下的表。

执行完迁移后，把你的 Supabase 用户 ID 加入站主表：

```sql
insert into public.site_admins (user_id)
values ('你的 auth.users.id')
on conflict (user_id) do nothing;
```

### 4. 启动开发环境

```bash
npm run dev
```

### 5. 运行校验

```bash
npm run lint
npm run build
```

## 内容配置

公开站的个人信息、项目卡片、技能展示等静态内容集中在：

```txt
src/content/site.ts
```

文章内容来自 Supabase 的 `blog_posts` 表，登录后在 `/dashboard/blog` 管理。
文章评论、访客留言和打卡均使用 Supabase，并在各自的后台审核页公开。执行 `005_add_guestbook_entries.sql` 后即可启用留言簿。

## 重要目录

```txt
src/
├─ app/
│  ├─ (public)/        # 公开博客页面
│  ├─ (dashboard)/     # 文章管理后台
│  ├─ feed.xml/        # RSS
│  ├─ api/revalidate/  # 主动刷新
│  ├─ robots.ts
│  ├─ sitemap.ts
│  └─ opengraph-image.tsx
├─ components/
│  ├─ dashboard/       # 文章管理组件
│  ├─ site/            # 公开站组件
│  └─ ui/              # 基础 UI 组件
├─ content/
│  └─ site.ts          # 静态站点内容
├─ lib/
│  ├─ blog.ts          # 公开博客读取
│  ├─ supabase*.ts     # Supabase 客户端
│  ├─ upload.ts        # 图片上传
│  └─ toc.ts           # 文章目录生成
└─ types/
   └─ index.ts
```

# Personal Career Site

一个基于 `Next.js + TypeScript + Tailwind CSS + Supabase` 的个人站点，当前目标是把公开站重构为求职导向的个人品牌页，同时保留私密工作台用于内容沉淀、训练记录与 AI 建议。

## 当前定位

- 公开站：求职展示、项目介绍、技术博客、Fitness 模块说明
- 私密工作台：文章管理、记录录入、训练日志、AI 分析
- 技术原则：先把结构做清楚，再逐步扩展，不为了“高级感”堆复杂度

## 公开页面

- `/`：首页，突出个人定位、技能、代表项目、最近更新和联系方式
- `/about`：Resume 风格的个人介绍页
- `/projects`：代表项目页
- `/blog`：技术记录 / 项目复盘 / 阶段总结
- `/fitness`：健身模块说明页

## 私密页面

- `/dashboard/*`：内容工作台与成长记录后台
- `/fit`：训练记录工作台
- `/fit/plan`：AI Fitness Advisor

## 技术栈

- `Next.js 16` App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Supabase Auth + Database`
- `Recharts`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写：

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://cagedsheep.cn

AI_PROVIDER=deepseek
AI_API_KEY=...
AI_BASE_URL=
AI_MODEL=
REVALIDATE_TOKEN=...
```

说明：

- `NEXT_PUBLIC_SITE_URL` 用于 sitemap、robots 和 metadata
- `REVALIDATE_TOKEN` 用于 `/api/revalidate` 的内容主动刷新鉴权
- `AI_PROVIDER` 当前支持 `openai`、`deepseek`、`gemini`、`openai-compatible`
- `AI_BASE_URL` 仅在你使用代理或兼容 OpenAI 的网关时需要

### 3. 初始化数据库

按顺序执行 `supabase/migrations` 下的 SQL。  
如果你的线上库来自旧版本，请先核对 `blog_posts`、`thoughts`、`profiles` 等表结构是否与当前代码一致。

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

公开站的个人信息、项目卡片、技能分组等内容集中在：

```txt
src/content/site.ts
```

如果你要替换成真实求职内容，优先修改这里。

## 重要目录

```txt
src/
├─ app/
│  ├─ (public)/        # 求职导向公开站
│  ├─ (dashboard)/     # 私密内容工作台
│  ├─ fit/             # 训练记录工作台
│  ├─ api/             # AI 分析与健身建议接口
│  ├─ robots.ts
│  ├─ sitemap.ts
│  └─ opengraph-image.tsx
├─ components/
│  ├─ site/            # 公开站组件
│  ├─ dashboard/       # 工作台组件
│  └─ ui/              # 基础 UI 组件
├─ content/
│  └─ site.ts          # 站点内容配置
├─ lib/
│  ├─ blog.ts
│  ├─ ai-service.ts
│  ├─ supabase-public.ts
│  └─ fit/advisor.ts
└─ types/
```

## 架构概览与模块边界

- 公开站（`src/app/(public)`）
  - 内容来源：`src/content/site.ts`（公开内容配置）、`src/lib/blog.ts`（公开博客读取）
  - 数据访问：只读公开数据，使用 `supabase-public` 客户端
  - 缓存策略：页面级 `revalidate` + `/api/revalidate` 主动刷新
- 私密工作台（`src/app/(dashboard)`）
  - 内容来源：`src/lib/services/*` 与 Supabase（需要登录）
  - 数据访问：Server Component 使用 `supabase-server`，Client 组件统一通过 `getSupabaseClient`
  - 权限边界：所有写操作必须绑定 `user_id`，依赖 Supabase RLS
- 训练工作台（`src/app/fit`）
  - 内容来源：`src/lib/fit/services` + `fit_*` 表
  - AI 建议：`/api/fit/plan` 使用近期训练与恢复数据

## 数据与服务层规范

- 统一入口：客户端与服务层使用 `getSupabaseClient`，服务层遇到 Supabase 错误统一抛出并记录日志。
- 职责边界：
  - `src/lib/services/*`：成长/日志/博客/事件/技能等业务数据。
  - `src/lib/fit/services`：训练动作、训练日志、训练趋势。
  - `src/lib/blog.ts`：公开站博客数据的只读访问。

## 数据库迁移与回滚

1. 按顺序执行 `supabase/migrations` 下的 SQL（文件名时间戳顺序）。
2. 如果线上库来自旧版本，先对比 `blog_posts`、`thoughts`、`profiles` 等表结构。
3. 回滚策略：
   - 迁移脚本建议在事务内执行（`BEGIN`/`COMMIT`）。
   - 回滚时按相反顺序执行删除/恢复脚本，并确认没有线上数据依赖。
   - 对已有表字段的修改，建议先备份再执行变更。

## 安全与权限核对

- Supabase RLS：确保 `user_id` 相关表仅允许本人读写。
- API 鉴权：`/api/analysis` 与 `/api/fit/plan` 均要求登录；`/api/revalidate` 使用 token 保护。
- 输入校验：API 请求体必须为 JSON，字符串字段需限制长度，避免异常 prompt 或 SQL 风险。

## 回归检查清单（发布前）

- [ ] 公开站首页、博客列表、博客详情是否可正常访问
- [ ] 登录后工作台（dashboard）是否能读取并写入数据
- [ ] `/api/analysis` 与 `/api/fit/plan` 能在登录状态下返回结果
- [ ] `/api/revalidate` token 校验生效，内容可刷新

## 后续建议

- 把 `src/content/site.ts` 替换成真实姓名、教育经历、项目结果和简历链接
- 逐步整理旧版 dashboard 的 lint warning 和 `<img>` 优化
- 如果博客文章量增加，可进一步拆为 `Blog` 与 `Notes` 两类内容
- 如果健身数据需要长期保留，可将 `fitness_advice` 从 `ai_analyses` 中拆成独立历史表

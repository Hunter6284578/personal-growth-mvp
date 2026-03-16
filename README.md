# 个人成长网站 MVP

一个基于 Next.js + TypeScript + Tailwind + Supabase 的个人成长追踪网站。

## 功能特性

### 公开区
- **首页** - 展示网站介绍和核心概念
- **博客** - 发布和阅读文章
- **想法** - 记录短内容
- **关于** - 个人介绍和六大属性说明

### 私密区（需登录）
- **Dashboard** - 总览页面，显示统计数据和快捷操作
- **属性面板** - 六大属性评分和调整
- **每日记录** - 记录每日总结、反思和计划
- **经历事件** - 记录人生重要时刻
- **体测数据** - 追踪身体健康指标
- **AI 分析** - 智能分析成长数据
- **设置** - 个人资料管理

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **图标**: Lucide React

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并填写你的 Supabase 配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 创建 Supabase 项目

1. 前往 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase/migrations/001_initial.sql` 中的 SQL 语句
3. 在 Authentication 中创建用户（用于登录私密区）

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
personal-growth-mvp/
├── src/
│   ├── app/
│   │   ├── (public)/           # 公开区页面组
│   │   │   ├── page.tsx        # 首页
│   │   │   ├── blog/           # 博客
│   │   │   ├── thoughts/       # 想法
│   │   │   └── about/          # 关于
│   │   ├── (dashboard)/        # 私密区页面组
│   │   │   └── dashboard/
│   │   │       ├── page.tsx    # 总览
│   │   │       ├── stats/      # 属性面板
│   │   │       ├── daily/      # 每日记录
│   │   │       ├── events/     # 经历事件
│   │   │       ├── fitness/    # 体测数据
│   │   │       ├── analysis/   # AI分析
│   │   │       └── settings/   # 设置
│   │   ├── api/
│   │   │   └── analysis/       # AI分析API
│   │   ├── login/              # 登录页
│   │   └── layout.tsx          # 根布局
│   ├── components/
│   │   ├── ui/                 # UI组件
│   │   └── Navigation.tsx      # 导航组件
│   ├── lib/                    # Supabase配置
│   ├── hooks/                  # 自定义Hooks
│   └── types/                  # TypeScript类型
├── supabase/
│   └── migrations/             # 数据库迁移
└── README.md
```

## 六大属性

1. **身体素质** - 身体健康、体能状况、运动能力
2. **执行力** - 行动力、任务完成度、拖延程度
3. **专注力** - 注意力集中、深度工作时间
4. **情绪稳定性** - 情绪管理、压力应对、心态平和
5. **社交状态** - 人际关系、社交活动、沟通能力
6. **创造力** - 创新思维、产出质量、学习速度

## 下一阶段开发计划

- [ ] 连接真实数据库，实现 CRUD 操作
- [ ] 添加 Recharts 图表展示
- [ ] 接入真实 AI API
- [ ] 博客管理后台
- [ ] 文件上传功能
- [ ] 数据导入导出

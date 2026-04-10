export interface SocialLink {
  label: string
  href: string
}

export interface ResumeBlock {
  title: string
  items: string[]
}

export interface ProjectLink {
  label: string
  href: string
}

export interface FeaturedProject {
  slug: string
  title: string
  tagline: string
  period: string
  status: 'online' | 'building'
  summary: string
  problem: string
  outcome: string
  roleBoundary: string
  responsibilities: string[]
  tradeoffs: string[]
  highlights: string[]
  evidence: string[]
  metrics: Array<{
    label: string
    value: string
  }>
  techStack: string[]
  links: ProjectLink[]
}

export interface FitnessCapability {
  title: string
  description: string
}

export const siteConfig = {
  name: 'CagedSheep',
  role: '能交付、能复盘、能持续迭代的全栈站点作者',
  roleShort: '极简个人站',
  location: '中国 · 上海时区',
  email: '996717215@qq.com',
  github: 'https://github.com/Hunter6284578',
  siteUrl: 'https://cagedsheep.cn',
  icpNo: '【ICP备案号】',
  icpLink: 'https://beian.miit.gov.cn/',
  resumeUrl: '',
  description:
    'CagedSheep 是一个“用证据说话”的个人站点：项目交付、技术复盘与持续迭代并行。',
  heroIntro:
    '我把个人站当成长期产品：每个模块都要有交付结果、技术取舍与可验证证据。',
  heroFocus: ['项目可验证', '技术可复盘', '系统可持续'],
  targetRoles: ['前端 / 全栈实习', '内容型产品工程', '工程化协作岗位'],
  now: [
    '持续迭代站点体验与内容结构',
    '沉淀技术实践与创作过程',
    '保持克制、稳定、长期更新',
  ],
  lookingFor:
    '目标岗位是前端/全栈方向实习与校招，期望参与真实业务迭代并持续交付。',
  contactLinks: [
    { label: 'GitHub', href: 'https://github.com/Hunter6284578' },
    { label: 'Email', href: 'mailto:996717215@qq.com' },
  ] as SocialLink[],
}

export const skillGroups = [
  {
    title: '前端',
    items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'App Router'],
  },
  {
    title: '后端 / 数据',
    items: ['Supabase', 'PostgreSQL', 'REST API', 'SQL Schema Design'],
  },
  {
    title: '工程化',
    items: ['模块化拆分', '表单与状态管理', 'SEO 基础', '部署与环境配置'],
  },
  {
    title: 'AI 集成',
    items: ['OpenAI-style API', 'Prompt 设计', '训练建议生成', 'Provider 抽象'],
  },
]

export const resumeBlocks: ResumeBlock[] = [
  {
    title: '教育背景',
    items: [
      '本科在读，计算机相关方向',
      '持续通过个人项目补齐产品、前端和全栈工程实践',
    ],
  },
  {
    title: '个人优势',
    items: [
      '能从需求目标出发拆信息架构，而不是只做界面堆砌',
      '重视可维护性，倾向于先建立清晰模型再做功能扩展',
      '愿意通过记录、复盘和数据反馈持续迭代个人系统',
    ],
  },
  {
    title: '求职关键词',
    items: [
      '求职导向个人品牌站',
      '内容平台与管理后台',
      '健身记录与 AI 建议整合',
    ],
  },
]

export const timeline = [
  {
    year: '现在',
    title: '重构个人品牌站',
    description: '将原有成长记录 MVP 调整为面向求职展示的长期平台。',
  },
  {
    year: '近期',
    title: '打通训练记录与 AI 建议',
    description: '把训练日志、体重趋势和恢复备注整合到统一的 Fitness 流程。',
  },
  {
    year: '持续',
    title: '内容沉淀与项目复盘',
    description: '围绕技术学习、项目迭代和成长记录稳定输出。',
  },
]

export const featuredProjects: FeaturedProject[] = [
  {
    slug: 'career-growth-platform',
    title: '个人品牌站与成长记录平台',
    tagline: '把求职展示、内容沉淀和个人数据记录整合到一个可维护的站点里。',
    period: '2026',
    status: 'online',
    summary:
      '基于 Next.js App Router + Supabase 重构公开站与私密工作台，并在 Vercel 上稳定部署。',
    problem:
      '把原本偏成长面板的 MVP 重构为真正服务求职展示的公开站，同时保留博客、记录和私密录入工作区。',
    outcome:
      '形成“公开展示 + 私密录入 + AI 分析”的统一架构，站点可持续迭代且可直接上线。',
    roleBoundary: '独立完成信息架构、页面开发、Supabase 数据层与 Vercel 发布链路。',
    responsibilities: [
      '负责信息架构重构与公开站页面设计',
      '设计前后台边界与内容管理流程',
      '实现认证、内容 CRUD、训练记录和 AI 调用封装',
    ],
    tradeoffs: [
      '优先保证部署稳定性与可维护性，弱化花哨交互',
      '对 AI 接口先做通用抽象，再补复杂策略',
    ],
    highlights: [
      '将原本偏游戏化的成长记录站改造成求职导向的个人品牌站',
      '用一套代码同时承载公开展示、博客沉淀和私密录入工作区',
      '为后续博客、训练记录和 AI 建议扩展预留清晰边界',
    ],
    evidence: [
      '线上域名持续可访问，主分支自动触发 Vercel 部署',
      '公开站与工作台共享一套数据模型，避免双系统重复维护',
      '关键页面提供 canonical、sitemap、JSON-LD 等 SEO 基础能力',
    ],
    metrics: [
      { label: '核心页面', value: '5 个公开页面 + 多个工作台页面' },
      { label: '部署方式', value: 'GitHub Push -> Vercel 自动发布' },
      { label: '内容链路', value: '博客 CRUD + 训练记录 + AI 分析' },
    ],
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Supabase'],
    links: [
      { label: 'GitHub', href: 'https://github.com/Hunter6284578' },
    ],
  },
  {
    slug: 'fitness-tracker',
    title: '训练记录与趋势追踪模块',
    tagline: '记录每次训练的动作、组数、重量和容量，并给出趋势反馈。',
    period: '2026',
    status: 'online',
    summary:
      '将训练记录模块嵌入个人站，强调真实使用与长期维护，而非一次性展示。',
    problem:
      '需要在不破坏求职主线的前提下，加入真正可用的训练记录能力，而不是只放一个“我在健身”的页面。',
    outcome:
      '实现日志录入、历史回看、AI 建议调用，为“记录->反馈->调整”提供闭环。',
    roleBoundary: '独立负责训练数据结构、录入流程、趋势展示与接口联调。',
    responsibilities: [
      '设计训练日志、动作库和离线缓存流程',
      '实现周训练频率、训练容量和历史记录展示',
      '控制复杂度，保持适合长期维护的模块边界',
    ],
    tradeoffs: [
      '先做关键字段与核心流程，避免一次性过度建模',
      '优先数据准确性和录入体验，再做可视化丰富度',
    ],
    highlights: [
      '支持训练日志录入、历史查看和动作维度分析',
      '保留私密数据录入能力，同时在公开站弱化展示不抢主线',
      '为后续体重趋势、恢复状态和目标管理预留扩展空间',
    ],
    evidence: [
      '已上线 /fit 工作台，支持训练与健康数据录入',
      '训练建议由真实历史数据驱动，不是纯静态文案',
      '数据表与接口按用户隔离，符合私密记录场景',
    ],
    metrics: [
      { label: '记录范围', value: '训练动作、组次、容量、健康数据' },
      { label: '分析周期', value: '默认近 14 天数据汇总' },
      { label: '接口能力', value: '/api/fit/plan 可返回结构化建议' },
    ],
    techStack: ['Next.js', 'Supabase', 'Recharts', 'Local Storage'],
    links: [],
  },
  {
    slug: 'ai-fitness-advisor',
    title: 'AI Fitness Advisor',
    tagline: '基于近期训练记录、体重和备注生成克制的训练建议。',
    period: '2026',
    status: 'building',
    summary:
      '抽象多 Provider AI 调用层，统一请求格式与错误处理，服务训练与成长分析场景。',
    problem:
      'AI 能力不能写死在单一接口和单一提示词里，必须为后续更换模型、扩展输入和保存历史留出边界。',
    outcome:
      '形成可替换模型的 AI 基础设施，降低后续更换服务商与扩展分析任务的成本。',
    roleBoundary: '负责 Provider 抽象、提示词编排、接口稳定性与调用保护。',
    responsibilities: [
      '设计 provider 抽象与环境变量配置方式',
      '定义输入摘要结构和建议输出格式',
      '实现建议生成接口与前端反馈状态',
    ],
    tradeoffs: [
      '先保证接口统一和可回退，再追求复杂 Prompt 能力',
      '对高成本调用增加基础限流与鉴权',
    ],
    highlights: [
      '避免把建议逻辑写死在单一模型或单一场景里',
      '支持未来接入 OpenAI、DeepSeek、Gemini 与兼容接口',
      '输出风格强调实用和克制，不伪装成医疗系统',
    ],
    evidence: [
      '支持 deepseek/openai/gemini/openai-compatible 多后端切换',
      '分析接口增加鉴权、限流、日志与统一错误返回',
      '可通过 revalidate 接口刷新内容缓存，保证发布链路可控',
    ],
    metrics: [
      { label: 'Provider 支持', value: '4 类' },
      { label: '接口约束', value: 'Node runtime + rate limit + auth' },
      { label: '输出场景', value: '周分析、事件分析、训练建议' },
    ],
    techStack: ['TypeScript', 'Fetch API', 'Prompt Engineering', 'Supabase'],
    links: [],
  },
]

export const fitnessCapabilities: FitnessCapability[] = [
  {
    title: '能记录',
    description: '训练日期、部位、动作、组数、次数、重量、有氧、体重和训练备注。',
  },
  {
    title: '能回看',
    description: '按日期与动作维度查看历史记录，关注训练频率和负重变化。',
  },
  {
    title: '能总结',
    description: '把训练记录作为个人长期主义的一部分，而不是零散打卡。',
  },
  {
    title: '能接 AI',
    description: '基于近期记录生成建议，作为复盘参考，不替代教练或医疗意见。',
  },
]

export const homeSignals = [
  { label: '代表项目', value: '3 个重点方向' },
  { label: '公开内容', value: '博客 / 记录持续沉淀' },
  { label: '健身模块', value: '训练记录 + AI 建议' },
  { label: '联系入口', value: 'GitHub / Email' },
]

export const blogThemes = ['技术学习', '项目复盘', '阶段总结']

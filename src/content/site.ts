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
  role: '清冷、克制、留白的个人网站',
  roleShort: '个人站',
  location: '中国 · 上海时区',
  email: '996717215@qq.com',
  github: 'https://github.com/Hunter6284578',
  siteUrl: 'https://cagedsheep.cn',
  icpNo: '【ICP备案号】',
  icpLink: 'https://beian.miit.gov.cn/',
  resumeUrl: '',
  description:
    '笼中羊，是我用来放置作品、文字与日常片段的安静角落。',
  heroIntro:
    '我想把生活里真正重要的东西留下来：正在做的事、做过的作品、和当下的心绪。',
  heroFocus: ['作品', '文字', '日常'],
  targetRoles: ['个人随笔', '作品陈列', '长期记录'],
  now: [
    '缓慢更新文字与照片',
    '整理作品与阶段片段',
    '保持稳定、克制地表达',
  ],
  lookingFor:
    '这里不追热点，也不追热闹，只做长期可回看的记录。',
  contactLinks: [
    { label: 'GitHub', href: 'https://github.com/Hunter6284578' },
    { label: 'Email', href: 'mailto:996717215@qq.com' },
  ] as SocialLink[],
}

export const skillGroups = [
  {
    title: '文字',
    items: ['随笔', '阶段记录', '复盘', '短句片段'],
  },
  {
    title: '影像',
    items: ['日常拍摄', '光影观察', '单图叙事', '图文组合'],
  },
  {
    title: '作品',
    items: ['个人项目', '过程记录', '版本迭代', '结果陈列'],
  },
  {
    title: '习惯',
    items: ['长期更新', '克制表达', '低噪声输出', '持续整理'],
  },
]

export const resumeBlocks: ResumeBlock[] = [
  {
    title: '关于我',
    items: [
      '一个正在学习如何好好生活与表达的人',
      '相信“慢一点，但持续地做”比短期爆发更重要',
    ],
  },
  {
    title: '在意的事',
    items: [
      '真实，不摆拍式表达',
      '留白，不堆叠信息噪音',
      '长期，不做一次性展示页',
    ],
  },
  {
    title: '这个站点',
    items: [
      '放作品，也放普通日常',
      '放结论，也放未完成的片段',
      '希望你能在这里看到“我本人”',
    ],
  },
]

export const timeline = [
  {
    year: '现在',
    title: '把站点调回真实表达',
    description: '删掉模板化语气，让内容更像“人”而不是“产品说明”。',
  },
  {
    year: '近期',
    title: '整理过去的作品与文字',
    description: '把散落的素材归档成可回看的作品与记录。',
  },
  {
    year: '持续',
    title: '长期更新',
    description: '不追求频率，只追求诚实和持续。',
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
      '把“求职介绍页”改造成真正可长期使用的个人网站。',
    problem:
      '旧版更像技术说明，缺少真实语气与个人气质。',
    outcome:
      '现在的站点更克制、更安静，也更接近我想长期保留的样子。',
    roleBoundary: '从结构、文案到视觉全部独立重写并持续维护。',
    responsibilities: [
      '重写首页、项目页、关于页与博客叙事结构',
      '统一站点调性，去掉功能演示口吻',
      '把内容更新流程做成可长期维护的习惯',
    ],
    tradeoffs: [
      '减少“功能感”，接受更朴素的页面结构',
      '优先真实表达，不追求面面俱到',
    ],
    highlights: [
      '内容从“介绍我会什么”改为“我在做什么、感受什么”',
      '页面从强功能导向转为作品与文字导向',
      '形成可持续更新的个人表达框架',
    ],
    evidence: [
      '线上访问内容已从功能文案切换为个人叙事',
      '站点信息结构围绕作品与文字重排',
      '保留基础 SEO 与备案信息，不牺牲可见性',
    ],
    metrics: [
      { label: '公开页面', value: '首页 / 作品 / 文字 / 关于' },
      { label: '更新方式', value: '长期小步更新' },
      { label: '目标', value: '更像本人而非模板' },
    ],
    techStack: ['文字', '影像', '记录', '更新'],
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
      '把日常训练与身体状态写成可回看的个人记录。',
    problem:
      '希望记录是生活的一部分，而不是展示素材。',
    outcome:
      '形成了“记录 -> 回看 -> 调整”的稳定节奏。',
    roleBoundary: '独立完成记录结构、页面内容与长期维护。',
    responsibilities: [
      '记录训练细节与阶段变化',
      '按周期整理趋势与感受',
      '减少无效字段，保留真正会回看的内容',
    ],
    tradeoffs: [
      '不追复杂图表，先保证记录能持续发生',
      '不追“打卡感”，只保留有意义的数据',
    ],
    highlights: [
      '把训练从“任务”变成可复盘的生活片段',
      '公开展示克制，不喧宾夺主',
      '持续更新而非短期冲刺',
    ],
    evidence: [
      '保留长期可回看的训练记录',
      '每个阶段都有文字与数据双线索',
      '公开页与私密记录边界清晰',
    ],
    metrics: [
      { label: '记录节奏', value: '按周整理' },
      { label: '内容形态', value: '数据 + 文字' },
      { label: '目标', value: '长期可持续' },
    ],
    techStack: ['训练', '恢复', '记录', '复盘'],
    links: [],
  },
  {
    slug: 'ai-fitness-advisor',
    title: 'AI Fitness Advisor',
    tagline: '基于近期训练记录、体重和备注生成克制的训练建议。',
    period: '2026',
    status: 'building',
    summary:
      '把 AI 作为辅助整理工具，而不是主角。',
    problem:
      '想保留“思考痕迹”，而不被自动化语言淹没。',
    outcome:
      'AI 只在需要时辅助归纳，不替代表达本身。',
    roleBoundary: '控制 AI 的使用边界与语气风格。',
    responsibilities: [
      '定义 AI 只做辅助总结的规则',
      '控制输出不过度模板化',
      '保留人工编辑与自我表达优先级',
    ],
    tradeoffs: [
      '限制 AI 出场频率，避免整站失去人味',
      '先保证内容真实，再追求效率',
    ],
    highlights: [
      'AI 作为工具，而不是叙事主体',
      '语气保持克制，避免过度包装',
      '内容依旧以本人视角为主',
    ],
    evidence: [
      'AI 输出会经过人工筛选和改写',
      '站点主页面仍保持个人表达语气',
      '辅助能力不喧宾夺主',
    ],
    metrics: [
      { label: '使用定位', value: '辅助整理' },
      { label: '内容主导', value: '人工表达' },
      { label: '目标', value: '低噪声输出' },
    ],
    techStack: ['节制', '筛选', '归纳', '表达'],
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

import type { LocalizedList, LocalizedText } from '@/lib/site-language'

export interface SocialLink {
  label: LocalizedText
  href: string
}

export interface ResumeBlock {
  title: LocalizedText
  items: LocalizedList
}

export interface ProjectLink {
  label: LocalizedText
  href: string
}

export interface FeaturedProject {
  slug: string
  title: LocalizedText
  tagline: LocalizedText
  period: string
  status: 'online' | 'building'
  summary: LocalizedText
  techStack: LocalizedList
  links: ProjectLink[]
}

export interface SkillGroup {
  title: LocalizedText
  items: LocalizedList
}

export interface FitnessCapability {
  title: LocalizedText
  description: LocalizedText
}

export interface SiteConfig {
  name: string
  title: string
  role: LocalizedText
  roleShort: LocalizedText
  location: LocalizedText
  email: string
  github: string
  siteUrl: string
  icpNo: string
  icpLink: string
  resumeUrl: string
  description: LocalizedText
  heroTitle: LocalizedText
  heroIntro: LocalizedText
  heroFocus: LocalizedList
  targetRoles: LocalizedList
  now: LocalizedList
  lookingFor: LocalizedText
  contactLinks: SocialLink[]
}

export const siteConfig: SiteConfig = {
  name: 'Hunter',
  title: 'Hunter · Growth Log',
  role: {
    zh: '做项目，记成长，持续成为想成为的人',
    en: 'Build projects, document growth, and keep becoming.',
  },
  roleShort: {
    zh: '成长日志',
    en: 'Growth Log',
  },
  location: {
    zh: '中国 · 上海时区',
    en: 'China · UTC+8',
  },
  email: '996717215@qq.com',
  github: 'https://github.com/Hunter6284578',
  siteUrl: 'https://cagedsheep.cn',
  icpNo: '【ICP备案号】',
  icpLink: 'https://beian.miit.gov.cn/',
  resumeUrl: '',
  description: {
    zh: 'Hunter · Growth Log 是一个记录项目、思考与长期成长过程的个人网站。',
    en: 'Hunter · Growth Log is a personal website for projects, reflections, and long-term growth.',
  },
  heroTitle: {
    zh: '公开构建，认真成长。',
    en: 'Building, learning, and growing in public.',
  },
  heroIntro: {
    zh: '这是我的个人空间：放项目、放思考，也记录自己如何一步步把想法变成现实。',
    en: 'This is my personal space for projects, reflections, and the process of turning ideas into reality.',
  },
  heroFocus: {
    zh: ['项目', '写作', '成长系统'],
    en: ['Projects', 'Writing', 'Growth Systems'],
  },
  targetRoles: {
    zh: ['Web 开发', 'AI 应用', '长期主义'],
    en: ['Web Development', 'AI Experiments', 'Long-term Growth'],
  },
  now: {
    zh: [
      '重构个人网站的公开表达层',
      '持续整理项目与阶段复盘',
      '实验 AI + 内容工作流',
    ],
    en: [
      'Refining the public layer of my personal site',
      'Organizing projects and reflection notes',
      'Experimenting with AI-powered content workflows',
    ],
  },
  lookingFor: {
    zh: '我希望这个网站像一份长期更新的成长日志，而不是一次性完成的展示页。',
    en: 'I want this website to feel like a living growth log, not a one-off portfolio page.',
  },
  contactLinks: [
    {
      label: { zh: 'GitHub', en: 'GitHub' },
      href: 'https://github.com/Hunter6284578',
    },
    {
      label: { zh: '邮箱', en: 'Email' },
      href: 'mailto:996717215@qq.com',
    },
  ] as SocialLink[],
}

export const skillGroups: SkillGroup[] = [
  {
    title: { zh: '构建', en: 'Building' },
    items: {
      zh: ['Next.js', 'React', 'TypeScript', '个人产品'],
      en: ['Next.js', 'React', 'TypeScript', 'Personal Products'],
    },
  },
  {
    title: { zh: '学习', en: 'Learning' },
    items: {
      zh: ['Supabase', 'PostgreSQL', 'AI 工作流', '系统化思考'],
      en: ['Supabase', 'PostgreSQL', 'AI Workflows', 'Structured Thinking'],
    },
  },
  {
    title: { zh: '表达', en: 'Reflecting' },
    items: {
      zh: ['项目复盘', '技术笔记', '成长日志', '公开写作'],
      en: ['Project Reviews', 'Technical Notes', 'Growth Logs', 'Writing in Public'],
    },
  },
  {
    title: { zh: '原则', en: 'Principles' },
    items: {
      zh: ['先完成再完美', '小步迭代', '长期持续', '用作品说话'],
      en: ['Build Before Perfect', 'Iterate in Small Steps', 'Stay Consistent', 'Let Work Speak'],
    },
  },
]

export const resumeBlocks: ResumeBlock[] = [
  {
    title: { zh: '我是谁', en: 'Who I Am' },
    items: {
      zh: [
        '我是 Hunter，对 Web 开发、个人系统和长期成长感兴趣。',
        '我更相信持续构建与长期记录，而不是短期冲刺。',
      ],
      en: [
        "I'm Hunter, interested in web development, personal systems, and long-term growth.",
        'I believe more in consistent building and documentation than short bursts of intensity.',
      ],
    },
  },
  {
    title: { zh: '我在意什么', en: 'What I Care About' },
    items: {
      zh: [
        '清晰而诚实的表达',
        '能长期维护的系统与节奏',
        '把想法真正做出来，而不是停留在概念层面',
      ],
      en: [
        'Clear and honest expression',
        'Systems and rhythms that can last',
        'Turning ideas into something real instead of leaving them abstract',
      ],
    },
  },
  {
    title: { zh: '这个网站是什么', en: 'What This Site Is' },
    items: {
      zh: [
        '一个展示项目、思考与成长过程的个人网站',
        '一个不断迭代中的数字花园',
        '一个让我对自己保持诚实的公开空间',
      ],
      en: [
        'A personal website for projects, reflections, and growth in progress',
        'A digital garden that keeps evolving',
        'A public space that helps me stay honest with myself',
      ],
    },
  },
]

export const timeline = [
  {
    year: { zh: '现在', en: 'Now' },
    title: {
      zh: '把个人网站重做成成长日志',
      en: 'Reframing the site as a growth log',
    },
    description: {
      zh: '从传统展示页转向更真实、更长期可维护的个人表达。',
      en: 'Shifting from a static portfolio into a more honest and maintainable personal space.',
    },
  },
  {
    year: { zh: '近期', en: 'Recent' },
    title: {
      zh: '整理项目、博客与阶段复盘',
      en: 'Organizing projects, blog content, and reflection notes',
    },
    description: {
      zh: '把散落的成果和想法整理成可回看的结构化内容。',
      en: 'Turning scattered work and thoughts into structured content worth revisiting.',
    },
  },
  {
    year: { zh: '接下来', en: 'Next' },
    title: {
      zh: '继续公开构建',
      en: 'Keep building in public',
    },
    description: {
      zh: '持续发布小而真实的更新，让网站始终保持生命力。',
      en: 'Keep publishing small but real updates so the website stays alive.',
    },
  },
]

export const featuredProjects: FeaturedProject[] = [
  {
    slug: 'growth-log-site',
    title: { zh: 'Growth Log 个人网站', en: 'Growth Log Personal Website' },
    tagline: {
      zh: '把个人品牌、项目展示和成长记录放进同一个叙事框架。',
      en: 'Combining personal branding, project showcase, and growth journaling in one narrative.',
    },
    period: '2026',
    status: 'online',
    summary: {
      zh: '重写了公开站的结构与文案，让它不再只是"我会什么"，而是更像"我在持续做什么"。支持中英文切换，围绕长期成长这条主线展开。',
      en: 'Rewrote the public site structure and copy so it feels less like "what I know" and more like "what I keep building." Supports bilingual switching, centered on long-term growth.',
    },
    techStack: {
      zh: ['Next.js', 'TypeScript', 'Tailwind CSS', '内容设计'],
      en: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Content Design'],
    },
    links: [
      { label: { zh: 'GitHub', en: 'GitHub' }, href: 'https://github.com/Hunter6284578' },
    ],
  },
  {
    slug: 'fitness-tracker',
    title: { zh: '训练记录系统', en: 'Fitness Tracking System' },
    tagline: {
      zh: '把训练、恢复和阶段反馈整理成可回看的长期记录。',
      en: 'Turning training, recovery, and feedback into a long-term system worth revisiting.',
    },
    period: '2026',
    status: 'online',
    summary: {
      zh: '训练记录、趋势回看和 AI 辅助建议的闭环。不做成复杂健身 App，优先保证记录可持续、可回看。',
      en: 'A loop of training logs, trend review, and AI-assisted suggestions. Not a complex fitness app—sustainable logging first.',
    },
    techStack: {
      zh: ['Supabase', 'Recharts', 'AI 接口'],
      en: ['Supabase', 'Recharts', 'AI APIs'],
    },
    links: [],
  },
  {
    slug: 'ai-workflow-experiment',
    title: { zh: 'AI 工作流实验', en: 'AI Workflow Experiment' },
    tagline: {
      zh: '把 AI 当作辅助整理和增强执行力的工具，而不是替代思考。',
      en: 'Using AI to assist organization and execution without replacing human judgment.',
    },
    period: '2026',
    status: 'building',
    summary: {
      zh: '探索如何把 AI 更自然地接入内容整理、分析和个人系统。不追求全自动，保留人工判断与最终编辑权。',
      en: 'Exploring how AI can be integrated more naturally into content organization and personal systems. No full automation—human judgment stays in the loop.',
    },
    techStack: {
      zh: ['Prompting', 'API 集成', '工作流设计'],
      en: ['Prompting', 'API Integration', 'Workflow Design'],
    },
    links: [],
  },
]

export const fitnessCapabilities: FitnessCapability[] = [
  {
    title: { zh: '记录', en: 'Log' },
    description: {
      zh: '记录训练日期、动作、组数、重量、有氧、体重和备注。',
      en: 'Log training date, exercises, sets, weights, cardio, body weight, and notes.',
    },
  },
  {
    title: { zh: '回看', en: 'Review' },
    description: {
      zh: '按日期和动作维度回看历史数据，观察长期趋势。',
      en: 'Review historical data by date and exercise to see long-term trends.',
    },
  },
  {
    title: { zh: '总结', en: 'Summarize' },
    description: {
      zh: '把零散记录变成能指导下个阶段的复盘信息。',
      en: 'Turn raw logs into reflections that can guide the next stage.',
    },
  },
  {
    title: { zh: '辅助建议', en: 'Assist' },
    description: {
      zh: '基于近期记录生成 AI 建议，作为参考而不是结论。',
      en: 'Generate AI suggestions from recent logs as guidance rather than authority.',
    },
  },
]

export const homeSignals = [
  {
    label: { zh: '核心模块', en: 'Core Modules' },
    value: { zh: '项目 / 日志 / 时间线', en: 'Projects / Journal / Timeline' },
  },
  {
    label: { zh: '语言', en: 'Language' },
    value: { zh: '中文默认 / 英文切换', en: 'Chinese default / English toggle' },
  },
  {
    label: { zh: '更新方式', en: 'Update Style' },
    value: { zh: '小步快跑，持续迭代', en: 'Small steps, steady iteration' },
  },
  {
    label: { zh: '联系', en: 'Contact' },
    value: { zh: 'GitHub / Email', en: 'GitHub / Email' },
  },
]

export const blogThemes: LocalizedList = {
  zh: ['项目复盘', '技术笔记', '成长日志'],
  en: ['Project Reviews', 'Technical Notes', 'Growth Logs'],
}

function assertNonEmpty(value: string, field: string) {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing content config: ${field}`)
  }
}

function assertLocalizedText(value: LocalizedText, field: string) {
  assertNonEmpty(value?.zh ?? '', `${field}.zh`)
  assertNonEmpty(value?.en ?? '', `${field}.en`)
}

function assertLocalizedList(value: LocalizedList, field: string) {
  if (!value || !Array.isArray(value.zh) || !Array.isArray(value.en)) {
    throw new Error(`Missing content config: ${field}`)
  }
  if (value.zh.length === 0 || value.en.length === 0) {
    throw new Error(`Empty content config: ${field}`)
  }
  value.zh.forEach((item, index) => assertNonEmpty(item, `${field}.zh[${index}]`))
  value.en.forEach((item, index) => assertNonEmpty(item, `${field}.en[${index}]`))
}

function assertUrl(value: string, field: string) {
  try {
    new URL(value)
  } catch {
    throw new Error(`Invalid content config URL: ${field}`)
  }
}

function validateSiteContent() {
  assertNonEmpty(siteConfig.name, 'siteConfig.name')
  assertNonEmpty(siteConfig.title, 'siteConfig.title')
  assertNonEmpty(siteConfig.email, 'siteConfig.email')
  assertNonEmpty(siteConfig.github, 'siteConfig.github')
  assertNonEmpty(siteConfig.siteUrl, 'siteConfig.siteUrl')
  assertLocalizedText(siteConfig.role, 'siteConfig.role')
  assertLocalizedText(siteConfig.roleShort, 'siteConfig.roleShort')
  assertLocalizedText(siteConfig.location, 'siteConfig.location')
  assertLocalizedText(siteConfig.description, 'siteConfig.description')
  assertLocalizedText(siteConfig.heroTitle, 'siteConfig.heroTitle')
  assertLocalizedText(siteConfig.heroIntro, 'siteConfig.heroIntro')
  assertLocalizedList(siteConfig.heroFocus, 'siteConfig.heroFocus')
  assertLocalizedList(siteConfig.targetRoles, 'siteConfig.targetRoles')
  assertLocalizedList(siteConfig.now, 'siteConfig.now')
  assertLocalizedText(siteConfig.lookingFor, 'siteConfig.lookingFor')
  assertUrl(siteConfig.siteUrl, 'siteConfig.siteUrl')
  assertUrl(siteConfig.github, 'siteConfig.github')
  if (siteConfig.icpLink) {
    assertUrl(siteConfig.icpLink, 'siteConfig.icpLink')
  }
  if (siteConfig.resumeUrl) {
    assertUrl(siteConfig.resumeUrl, 'siteConfig.resumeUrl')
  }
  siteConfig.contactLinks.forEach((link, index) => {
    assertLocalizedText(link.label, `siteConfig.contactLinks[${index}].label`)
    assertNonEmpty(link.href, `siteConfig.contactLinks[${index}].href`)
  })

  skillGroups.forEach((group, index) => {
    assertLocalizedText(group.title, `skillGroups[${index}].title`)
    assertLocalizedList(group.items, `skillGroups[${index}].items`)
  })

  const projectSlugs = new Set<string>()
  featuredProjects.forEach((project, index) => {
    assertNonEmpty(project.slug, `featuredProjects[${index}].slug`)
    assertLocalizedText(project.title, `featuredProjects[${index}].title`)
    assertLocalizedText(project.tagline, `featuredProjects[${index}].tagline`)
    assertNonEmpty(project.period, `featuredProjects[${index}].period`)
    assertLocalizedText(project.summary, `featuredProjects[${index}].summary`)
    assertLocalizedList(project.techStack, `featuredProjects[${index}].techStack`)
    if (projectSlugs.has(project.slug)) {
      throw new Error(`Duplicate featuredProjects slug: ${project.slug}`)
    }
    projectSlugs.add(project.slug)
    project.links.forEach((link, linkIndex) => {
      assertLocalizedText(link.label, `featuredProjects[${index}].links[${linkIndex}].label`)
      assertNonEmpty(link.href, `featuredProjects[${index}].links[${linkIndex}].href`)
    })
  })

  fitnessCapabilities.forEach((item, index) => {
    assertLocalizedText(item.title, `fitnessCapabilities[${index}].title`)
    assertLocalizedText(item.description, `fitnessCapabilities[${index}].description`)
  })

  homeSignals.forEach((signal, index) => {
    assertLocalizedText(signal.label, `homeSignals[${index}].label`)
    assertLocalizedText(signal.value, `homeSignals[${index}].value`)
  })

  assertLocalizedList(blogThemes, 'blogThemes')
}

if (process.env.NODE_ENV !== 'production') {
  validateSiteContent()
}

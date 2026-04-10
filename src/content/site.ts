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
  problem: LocalizedText
  outcome: LocalizedText
  roleBoundary: LocalizedText
  responsibilities: LocalizedList
  tradeoffs: LocalizedList
  highlights: LocalizedList
  evidence: LocalizedList
  metrics: Array<{
    label: LocalizedText
    value: LocalizedText
  }>
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

export const siteConfig = {
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
        'I’m Hunter, interested in web development, personal systems, and long-term growth.',
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
      zh: '我重写了公开站的结构与文案，让它不再只是“我会什么”，而是更像“我在持续做什么”。',
      en: 'I rewrote the public site structure and copy so it feels less like “what I know” and more like “what I keep building.”',
    },
    problem: {
      zh: '旧版页面更偏功能说明，缺少个人气质与统一叙事。',
      en: 'The old version explained features well, but lacked personality and a coherent narrative.',
    },
    outcome: {
      zh: '现在首页、关于页和作品页都围绕长期成长这条主线展开。',
      en: 'Now the home, about, and projects pages all revolve around the theme of long-term growth.',
    },
    roleBoundary: {
      zh: '独立完成内容策划、页面设计、前端实现与持续维护。',
      en: 'I handled the content strategy, page design, frontend implementation, and ongoing maintenance independently.',
    },
    responsibilities: {
      zh: [
        '重构公开站信息架构与视觉层级',
        '重写中英文文案与首页叙事',
        '加入语言切换能力和更清晰的品牌表达',
      ],
      en: [
        'Restructured the information architecture and visual hierarchy of the public site',
        'Rewrote the bilingual copy and homepage narrative',
        'Added language switching and a clearer brand identity',
      ],
    },
    tradeoffs: {
      zh: ['减少花哨装饰，优先清晰与可读性', '先把核心内容做好，再扩展复杂功能'],
      en: ['Reduced decorative effects to prioritize clarity and readability', 'Focused on core content before expanding into advanced features'],
    },
    highlights: {
      zh: ['建立统一的 Growth Log 品牌感', '支持中文默认 + 英文切换', '首页更强调项目、思考与时间线'],
      en: ['Established a unified Growth Log brand', 'Supports Chinese by default with English switching', 'The homepage now emphasizes projects, reflections, and timeline'],
    },
    evidence: {
      zh: ['公开页面结构更完整', '文案从模板式表述转向个人化表达', '保留了后续接入 CMS 与博客内容的扩展空间'],
      en: ['The public pages now feel more complete', 'The copy moved from template language to a more personal voice', 'The structure still leaves room for future CMS and blog expansion'],
    },
    metrics: [
      {
        label: { zh: '页面模块', en: 'Page Modules' },
        value: { zh: '首页 / 关于 / 作品 / 日志', en: 'Home / About / Projects / Journal' },
      },
      {
        label: { zh: '语言', en: 'Languages' },
        value: { zh: '中文默认 + 英文切换', en: 'Chinese default + English toggle' },
      },
      {
        label: { zh: '目标', en: 'Goal' },
        value: { zh: '更真实、更长期', en: 'More honest, more durable' },
      },
    ],
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
      zh: '这个模块让我把“自律”和“反馈”真正落到日常，而不只是写在目标清单里。',
      en: 'This module helps me turn discipline and feedback into daily practice rather than abstract goals.',
    },
    problem: {
      zh: '普通打卡很难形成真正有效的长期复盘。',
      en: 'Simple check-ins rarely lead to meaningful long-term reflection.',
    },
    outcome: {
      zh: '形成了训练记录、趋势回看和 AI 辅助建议的闭环。',
      en: 'It created a loop of training logs, trend review, and AI-assisted suggestions.',
    },
    roleBoundary: {
      zh: '独立设计记录结构、展示界面和后续可扩展的数据逻辑。',
      en: 'I independently designed the logging structure, interface, and expandable data logic.',
    },
    responsibilities: {
      zh: ['设计训练记录字段与录入流程', '构建趋势回看页面', '探索 AI 在真实日常场景中的辅助价值'],
      en: ['Designed the logging fields and input flow', 'Built pages for reviewing trends', 'Explored how AI can help in a real daily scenario'],
    },
    tradeoffs: {
      zh: ['不把它做成复杂健身 App', '优先保证记录可持续，再追求复杂分析'],
      en: ['Did not turn it into a complex fitness app', 'Prioritized sustainable logging before advanced analytics'],
    },
    highlights: {
      zh: ['真实数据场景', '长期积累价值明显', '适合展示系统化思维'],
      en: ['Grounded in real data', 'Compounds in value over time', 'A good showcase of systems thinking'],
    },
    evidence: {
      zh: ['支持训练日志录入', '支持阶段回看', '支持 AI 生成辅助建议'],
      en: ['Supports workout log entry', 'Supports reviewing stages over time', 'Supports AI-generated assistant feedback'],
    },
    metrics: [
      { label: { zh: '记录维度', en: 'Dimensions' }, value: { zh: '训练 / 体重 / 恢复', en: 'Training / Weight / Recovery' } },
      { label: { zh: '节奏', en: 'Cadence' }, value: { zh: '按周回看', en: 'Reviewed weekly' } },
      { label: { zh: '定位', en: 'Positioning' }, value: { zh: '长期自我管理', en: 'Long-term self-management' } },
    ],
    techStack: {
      zh: ['Supabase', 'Recharts', '数据记录', 'AI 接口'],
      en: ['Supabase', 'Recharts', 'Data Logging', 'AI APIs'],
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
      zh: '我正在探索如何把 AI 更自然地接入内容整理、分析和个人系统中。',
      en: 'I am exploring how AI can be integrated more naturally into content organization, analysis, and personal systems.',
    },
    problem: {
      zh: '很多 AI 场景看起来高效，但不一定真正适合长期使用。',
      en: 'Many AI use cases look efficient but do not hold up as sustainable long-term workflows.',
    },
    outcome: {
      zh: '当前目标是建立低噪声、可解释、可持续使用的 AI 辅助流程。',
      en: 'The current goal is to build low-noise, explainable, and sustainable AI-assisted workflows.',
    },
    roleBoundary: {
      zh: '负责提示词策略、使用边界设计与具体场景接入。',
      en: 'I define prompting strategies, usage boundaries, and integration in concrete scenarios.',
    },
    responsibilities: {
      zh: ['设计适合个人站的 AI 辅助场景', '控制输出质量和语气风格', '把 AI 放在辅助而非主导的位置'],
      en: ['Designed AI-assisted scenarios suited to a personal site', 'Controlled output quality and tone', 'Kept AI in a supporting rather than leading role'],
    },
    tradeoffs: {
      zh: ['不追求全自动', '保留人工判断与最终编辑权'],
      en: ['Avoided full automation', 'Preserved human judgment and final editorial control'],
    },
    highlights: {
      zh: ['强调真实使用场景', '限制模板化语言', '更关注是否真正提高长期效率'],
      en: ['Focused on real use cases', 'Limited overly templated language', 'Measured value by long-term usefulness'],
    },
    evidence: {
      zh: ['已接入分析接口', '正在探索内容工作流连接方式', '保留人工改写环节'],
      en: ['Analysis APIs are already integrated', 'Content workflow integrations are being explored', 'Manual rewriting remains part of the process'],
    },
    metrics: [
      { label: { zh: '定位', en: 'Role' }, value: { zh: '辅助工具', en: 'Assistant Tool' } },
      { label: { zh: '原则', en: 'Principle' }, value: { zh: '人主导，AI 辅助', en: 'Human-led, AI-assisted' } },
      { label: { zh: '状态', en: 'Status' }, value: { zh: '持续实验中', en: 'Continuously experimenting' } },
    ],
    techStack: {
      zh: ['Prompting', 'API 集成', '内容整理', '工作流设计'],
      en: ['Prompting', 'API Integration', 'Content Structuring', 'Workflow Design'],
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

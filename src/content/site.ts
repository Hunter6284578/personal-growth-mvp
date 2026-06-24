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
  note?: LocalizedText
  techStack: LocalizedList
  links: ProjectLink[]
}

export interface SkillGroup {
  title: LocalizedText
  items: LocalizedList
}

export interface HomeEntryPoint {
  title: LocalizedText
  description: LocalizedText
  href: string
}

export const siteConfig = {
  name: 'Hunter',
  title: 'Hunter',
  role: {
    zh: '生物医学工程学生 · AI 学习档案',
    en: 'Biomedical Engineering Student · AI Learning Archive',
  },
  roleShort: {
    zh: 'AI 学习档案',
    en: 'AI Learning Archive',
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
    zh: '一个生物医学工程学生的 AI 学习档案，记录深度学习、大模型、医工交叉项目，以及那些真实卡住又慢慢解开的 Bug。',
    en: 'An AI learning archive by a biomedical engineering student, collecting deep learning notes, LLM explorations, biomedical projects, and bugs slowly untangled.',
  },
  heroTitle: {
    zh: '在医工和 AI 之间，慢慢把问题拆开。',
    en: 'Taking problems apart between biomedical engineering and AI.',
  },
  heroIntro: {
    zh: '我目前是生物医学工程大二学生，对深度学习、大模型和医学健康场景里的 AI 应用很感兴趣。这个网站用来留下学习过程：问题、报错、尝试、失败、解决，以及一些正在成形的作品。',
    en: 'I am a sophomore studying biomedical engineering, interested in deep learning, large language models, and AI in health contexts. This site keeps the process: questions, errors, attempts, failures, fixes, and small projects taking shape.',
  },
  heroFocus: {
    zh: ['深度学习', '大模型', '医工交叉'],
    en: ['Deep Learning', 'LLMs', 'Biomedical AI'],
  },
  targetRoles: {
    zh: ['AI 学习', 'Bug 复盘', '项目实验'],
    en: ['AI Learning', 'Bug Reviews', 'Project Experiments'],
  },
  now: {
    zh: [
      '整理深度学习和大模型学习记录',
      '把遇到的 Bug 和排查过程写完整',
      '慢慢积累医工方向的小实验和作品',
    ],
    en: [
      'Organizing deep learning and LLM notes',
      'Writing down bugs and debugging paths',
      'Growing small biomedical engineering experiments',
    ],
  },
  lookingFor: {
    zh: '我希望这个网站像一本长期打开的实验记录本，而不是一次性写完的展示页。',
    en: 'I want this site to feel like a long-running lab notebook, not a one-off showcase.',
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

export const homeEntryPoints: HomeEntryPoint[] = [
  {
    title: { zh: '学习记录', en: 'Learning Notes' },
    description: {
      zh: '记录深度学习、大模型、医工课程和工具使用中一点点弄明白的东西。',
      en: 'Notes on deep learning, LLMs, biomedical coursework, and tools I slowly understand.',
    },
    href: '/blog?category=深度学习',
  },
  {
    title: { zh: 'Bug 复盘', en: 'Bug Reviews' },
    description: {
      zh: '保留报错、猜测、排查路径和最后解决方式，不把弯路擦掉。',
      en: 'Keeping errors, guesses, debugging paths, and fixes without erasing the detours.',
    },
    href: '/blog?category=Bug 复盘',
  },
  {
    title: { zh: '作品 / 实验', en: 'Works / Experiments' },
    description: {
      zh: '放一些正在做、已经做完或还在整理的小项目，像一个慢慢扩展的作品架。',
      en: 'A slowly expanding shelf of small projects: finished, ongoing, or still being tidied.',
    },
    href: '/projects',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    title: { zh: '正在学', en: 'Learning' },
    items: {
      zh: ['深度学习', '大模型', 'PyTorch', '医学健康场景'],
      en: ['Deep Learning', 'LLMs', 'PyTorch', 'Health Contexts'],
    },
  },
  {
    title: { zh: '记录', en: 'Writing' },
    items: {
      zh: ['Bug 复盘', '技术笔记', '项目过程', '论文阅读'],
      en: ['Bug Reviews', 'Technical Notes', 'Project Process', 'Paper Reading'],
    },
  },
  {
    title: { zh: '偏好', en: 'Taste' },
    items: {
      zh: ['清楚一点', '克制一点', '能长期维护', '不要太吵'],
      en: ['Clearer', 'Quieter', 'Maintainable', 'Less noisy'],
    },
  },
]

export const resumeBlocks: ResumeBlock[] = [
  {
    title: { zh: '我是谁', en: 'Who I Am' },
    items: {
      zh: [
        '我是 Hunter，目前是生物医学工程大二学生。',
        '我对深度学习、大模型和医学健康场景里的 AI 应用感兴趣。',
      ],
      en: [
        "I'm Hunter, a sophomore studying biomedical engineering.",
        'I am interested in deep learning, LLMs, and AI applications in health contexts.',
      ],
    },
  },
  {
    title: { zh: '我在意什么', en: 'What I Care About' },
    items: {
      zh: [
        '把问题拆开，而不是只留下最后答案',
        '记录真实排查路径，包括走错的路',
        '让作品慢慢长出来，而不是一次性包装好',
      ],
      en: [
        'Taking problems apart instead of keeping only final answers',
        'Recording real debugging paths, including wrong turns',
        'Letting projects grow slowly instead of packaging them too early',
      ],
    },
  },
  {
    title: { zh: '这个网站是什么', en: 'What This Site Is' },
    items: {
      zh: [
        '一本公开的学习记录本',
        '一个放 Bug、项目、论文和实验的小档案馆',
        '一个以后可以写进简历，但不被简历格式绑住的空间',
      ],
      en: [
        'A public learning notebook',
        'A small archive for bugs, projects, papers, and experiments',
        'A space that can support a resume without being shaped like one',
      ],
    },
  },
]

export const timeline = [
  {
    year: { zh: '现在', en: 'Now' },
    title: {
      zh: '把个人网站重做成 AI 学习档案',
      en: 'Reworking the personal site into an AI learning archive',
    },
    description: {
      zh: '从普通博客转向更贴近学习过程、Bug 复盘和医工 AI 项目的记录方式。',
      en: 'Shifting from a generic blog toward learning notes, bug reviews, and biomedical AI experiments.',
    },
  },
  {
    year: { zh: '近期', en: 'Recent' },
    title: {
      zh: '整理学习系列、项目和阶段复盘',
      en: 'Organizing learning series, projects, and reflection notes',
    },
    description: {
      zh: '把散落的成果和困惑整理成以后能回看的路径。',
      en: 'Turning scattered work and questions into paths worth revisiting later.',
    },
  },
  {
    year: { zh: '接下来', en: 'Next' },
    title: {
      zh: '继续公开构建',
      en: 'Keep publishing small updates',
    },
    description: {
      zh: '持续发布小而真实的更新，让网站保持生命力。',
      en: 'Keep publishing small but real updates so the website stays alive.',
    },
  },
]

export const featuredProjects: FeaturedProject[] = [
  {
    slug: 'ai-learning-archive',
    title: { zh: 'AI 学习档案网站', en: 'AI Learning Archive Site' },
    tagline: {
      zh: '一个尽量轻的个人网站，用来记录学习、Bug、项目和慢慢变清楚的问题。',
      en: 'A deliberately light personal site for learning notes, bugs, projects, and questions becoming clearer.',
    },
    period: '2026',
    status: 'online',
    summary: {
      zh: '这个网站本身也是一个作品：它不追求功能很多，而是服务长期记录。现在它更像一本公开的学习笔记，放下真实的过程，而不是只展示整理好的结果。',
      en: 'This site is itself a small project: it is not trying to be feature-heavy, but to support long-term notes. It works more like a public notebook than a polished-only portfolio.',
    },
    note: {
      zh: '现在卡在：怎样让它既能帮助未来找实习，又不失去个人记录的松弛感。',
      en: 'Current tension: making it useful for future internships without losing the looseness of a personal notebook.',
    },
    techStack: {
      zh: ['Next.js', 'TypeScript', 'Supabase', '内容整理'],
      en: ['Next.js', 'TypeScript', 'Supabase', 'Content Editing'],
    },
    links: [
      { label: { zh: 'GitHub', en: 'GitHub' }, href: 'https://github.com/Hunter6284578' },
    ],
  },
]

export const homeSignals = [
  {
    label: { zh: '身份', en: 'Identity' },
    value: { zh: '生物医学工程 / AI 学习', en: 'Biomedical Engineering / AI Learning' },
  },
  {
    label: { zh: '内容', en: 'Content' },
    value: { zh: 'Bug / 笔记 / 项目 / 论文', en: 'Bugs / Notes / Projects / Papers' },
  },
  {
    label: { zh: '更新方式', en: 'Update Style' },
    value: { zh: '慢慢写，慢慢改', en: 'Write slowly, revise slowly' },
  },
  {
    label: { zh: '联系', en: 'Contact' },
    value: { zh: 'GitHub / Email', en: 'GitHub / Email' },
  },
]

export const blogThemes: LocalizedList = {
  zh: ['Bug 复盘', '深度学习', '大模型', '医工笔记', '项目记录'],
  en: ['Bug Reviews', 'Deep Learning', 'LLMs', 'Biomedical Notes', 'Project Notes'],
}

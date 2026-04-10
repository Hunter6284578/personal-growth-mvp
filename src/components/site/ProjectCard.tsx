import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { FeaturedProject } from '@/content/site'
import { pickList, pickText, type SiteLanguage } from '@/lib/site-language'

interface ProjectCardProps {
  project: FeaturedProject
  lang: SiteLanguage
  compact?: boolean
}

export function ProjectCard({ project, lang, compact = false }: ProjectCardProps) {
  const responsibilities = pickList(project.responsibilities, lang)
  const tradeoffs = pickList(project.tradeoffs, lang)
  const highlights = pickList(project.highlights, lang)
  const evidence = pickList(project.evidence, lang)
  const techStack = pickList(project.techStack, lang)

  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.95)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {project.period}
            </span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-slate-300">
              {project.status === 'online' ? (lang === 'zh' ? '已上线' : 'Live') : lang === 'zh' ? '迭代中' : 'Building'}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              {pickText(project.title, lang)}
            </h3>
            <p className="mt-2 text-base leading-7 text-slate-300">{pickText(project.tagline, lang)}</p>
          </div>
        </div>
        <Link
          href={`/projects#${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 transition-colors hover:text-white"
        >
          {lang === 'zh' ? '查看详情' : 'View details'}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-6 text-sm leading-7 text-slate-300">{pickText(project.summary, lang)}</p>

      <div className={`mt-6 grid gap-4 ${compact ? 'md:grid-cols-2 xl:grid-cols-3' : 'xl:grid-cols-3'}`}>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '问题' : 'Problem'}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{pickText(project.problem, lang)}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '我做了什么' : 'What I Did'}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {responsibilities[0]}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '结果' : 'Outcome'}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{pickText(project.outcome, lang)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '我的角色' : 'My Role'}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{pickText(project.roleBoundary, lang)}</p>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '过程' : 'Process'}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {responsibilities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '取舍' : 'Trade-offs'}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {tradeoffs.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '亮点' : 'Highlights'}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '证据' : 'Evidence'}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {evidence.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {project.metrics.map((metric) => (
          <div key={pickText(metric.label, lang)} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{pickText(metric.label, lang)}</p>
            <p className="mt-2 text-sm font-semibold text-slate-100">{pickText(metric.value, lang)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-300"
          >
            {tech}
          </span>
        ))}
      </div>

      {project.links.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {project.links.map((link) => (
            <Link
              key={`${project.slug}-${link.href}`}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400/40 hover:text-white"
            >
              {pickText(link.label, lang)}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  )
}

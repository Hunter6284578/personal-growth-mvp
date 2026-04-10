import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { FeaturedProject } from '@/content/site'

interface ProjectCardProps {
  project: FeaturedProject
  compact?: boolean
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(24,24,27,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {project.period}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {project.status === 'online' ? '可运行' : '迭代中'}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
              {project.title}
            </h3>
            <p className="mt-2 text-base leading-7 text-stone-600">{project.tagline}</p>
          </div>
        </div>
        <Link
          href={`/projects#${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
        >
          查看详情
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-6 text-sm leading-7 text-stone-700">{project.summary}</p>

      <div className={`mt-6 grid gap-4 ${compact ? 'md:grid-cols-2 xl:grid-cols-3' : 'xl:grid-cols-3'}`}>
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">这件事从哪里开始</p>
          <p className="mt-3 text-sm leading-6 text-stone-700">{project.problem}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">我主要做了什么</p>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            {project.responsibilities[0]}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">最后留下了什么</p>
          <p className="mt-3 text-sm leading-6 text-stone-700">{project.outcome}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">我在其中的位置</p>
        <p className="mt-3 text-sm leading-6 text-stone-700">{project.roleBoundary}</p>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">过程里的动作</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {project.responsibilities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">当时的取舍</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {project.tradeoffs.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">这件事说明了什么</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {project.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">可看的痕迹</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {project.evidence.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {project.metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{metric.label}</p>
            <p className="mt-2 text-sm font-semibold text-stone-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700"
          >
            {tech}
          </span>
        ))}
      </div>

      {project.links.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {project.links.map((link) => (
            <Link
              key={`${project.slug}-${link.label}`}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  )
}

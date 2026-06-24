import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { FeaturedProject } from '@/content/site'
import { pickList, pickText, type SiteLanguage } from '@/lib/site-language'

interface ProjectCardProps {
  project: FeaturedProject
  lang: SiteLanguage
}

export function ProjectCard({ project, lang }: ProjectCardProps) {
  const techStack = pickList(project.techStack, lang)

  return (
    <article className="content-card hover-paper">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">{project.period}</span>
            <span className="tag-minimal">
              {project.status === 'online' ? (lang === 'zh' ? '已上线' : 'Live') : lang === 'zh' ? '迭代中' : 'Building'}
            </span>
          </div>
          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-bright)' }}>
            {pickText(project.title, lang)}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{pickText(project.tagline, lang)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{pickText(project.summary, lang)}</p>

      {project.note ? (
        <p className="project-note mt-4">
          {pickText(project.note, lang)}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {techStack.map((tech) => (
          <span key={tech} className="tag-minimal">{tech}</span>
        ))}
      </div>

      {project.links.length > 0 ? (
        <div className="mt-5">
          {project.links.map((link) => (
            <Link
              key={`${project.slug}-${link.href}`}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              className="cta-secondary"
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

import Link from 'next/link'
import { siteConfig } from '@/content/site'
import { pickText, type SiteLanguage } from '@/lib/site-language'

interface SiteFooterProps {
  lang: SiteLanguage
}

export function SiteFooter({ lang }: SiteFooterProps) {
  return (
    <footer className="mt-24 py-10" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-0">
        <p className="hand-note mb-6">
          {lang === 'zh'
            ? '在有限之境，写下仍愿意回看的东西。'
            : 'Write what\'s worth rereading, within limits.'}
        </p>
        <div className="flex flex-col gap-4 text-sm" style={{ color: 'var(--text-dim)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} {siteConfig.title}</span>
            <Link href={siteConfig.github} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-[var(--text-bright)]">
              GitHub
            </Link>
            <Link href="/blog" className="transition-colors hover:text-[var(--text-bright)]">{lang === 'zh' ? '博客' : 'Blog'}</Link>
            <Link href="/projects" className="transition-colors hover:text-[var(--text-bright)]">{lang === 'zh' ? '作品' : 'Projects'}</Link>
            <a href={siteConfig.icpLink} target="_blank" rel="noreferrer noopener nofollow" className="transition-colors hover:text-[var(--text-bright)]">
              {siteConfig.icpNo}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

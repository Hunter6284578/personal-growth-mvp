import Link from 'next/link'
import { siteConfig } from '@/content/site'
import type { SiteLanguage } from '@/lib/site-language'

interface SiteFooterProps {
  lang: SiteLanguage
}

export function SiteFooter({ lang }: SiteFooterProps) {
  return (
    <footer className="mt-20 py-8" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="mx-auto max-w-2xl px-6 sm:px-8 lg:px-0">
        <div className="flex flex-col gap-4 text-sm" style={{ color: 'var(--text-dim)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} {siteConfig.title}</span>
            <Link href="/blog" className="transition-colors hover:text-[var(--text-bright)]">{lang === 'zh' ? '博客' : 'Blog'}</Link>
            <Link href={`mailto:${siteConfig.email}`} className="transition-colors hover:text-[var(--text-bright)]">Email</Link>
            <a href={siteConfig.icpLink} target="_blank" rel="noreferrer noopener nofollow" className="transition-colors hover:text-[var(--text-bright)]">
              {siteConfig.icpNo}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { siteConfig } from '@/content/site'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/structured-data'
import { pickText, type SiteLanguage } from '@/lib/site-language'

interface SiteFooterProps {
  lang: SiteLanguage
}

export function SiteFooter({ lang }: SiteFooterProps) {
  const orgSchema = getOrganizationSchema()
  const websiteSchema = getWebsiteSchema()

  return (
    <footer className="mt-20 py-8 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 sm:px-8 lg:px-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} {siteConfig.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link href={siteConfig.github} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-[var(--text-bright)]">
            GitHub
          </Link>
          <Link href="/blog" className="transition-colors hover:text-[var(--text-bright)]">{lang === 'zh' ? '日志' : 'Journal'}</Link>
          <Link href="/projects" className="transition-colors hover:text-[var(--text-bright)]">{lang === 'zh' ? '作品' : 'Projects'}</Link>
          <a href={siteConfig.icpLink} target="_blank" rel="noreferrer noopener nofollow" className="transition-colors hover:text-[var(--text-bright)]">
            {siteConfig.icpNo}
          </a>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </footer>
  )
}

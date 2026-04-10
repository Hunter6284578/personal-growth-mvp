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
    <footer className="mt-10 border-t border-white/10 py-8 text-sm text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-medium text-slate-200">© {new Date().getFullYear()} {siteConfig.title}</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{pickText(siteConfig.description, lang)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={siteConfig.github} target="_blank" rel="noreferrer noopener">
            GitHub
          </Link>
          <Link href="/blog">{lang === 'zh' ? '日志' : 'Journal'}</Link>
          <Link href="/projects">{lang === 'zh' ? '作品' : 'Projects'}</Link>
          <Link href={`mailto:${siteConfig.email}`}>{lang === 'zh' ? '邮箱' : 'Email'}</Link>
          <a href={siteConfig.icpLink} target="_blank" rel="noreferrer noopener nofollow">
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

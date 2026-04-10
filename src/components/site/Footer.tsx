import Link from 'next/link'
import { siteConfig } from '@/content/site'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/structured-data'

export function SiteFooter() {
  const orgSchema = getOrganizationSchema()
  const websiteSchema = getWebsiteSchema()

  return (
    <footer className="mt-8 border-t border-stone-200 py-6 text-sm text-stone-600">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={siteConfig.github} target="_blank" rel="noreferrer noopener">
            GitHub
          </Link>
          <Link href="/blog">Blog</Link>
          <Link href="/projects">Projects</Link>
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

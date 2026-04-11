import Link from 'next/link'
import { ArrowRight, NotebookPen, Mail, Eye } from 'lucide-react'

import { siteConfig } from '@/content/site'
import { getPublishedPosts } from '@/lib/blog'
import { formatDate, getReadingTimeLabel, pickText } from '@/lib/site-language'

import { getCurrentLanguage } from '@/lib/site-language.server'

export const revalidate = 300

export default async function HomePage() {
  const lang = await getCurrentLanguage()
  const recentPosts = (await getPublishedPosts()).slice(0, 5)

  return (
    <div className="space-y-20 lg:space-y-28">
      {/* Hero */}
      <section>
        <div className="space-y-6">
          <div>
            <p className="eyebrow">{siteConfig.title}</p>
            <h1 className="mt-3 text-3xl leading-snug sm:text-4xl lg:text-[2.5rem] lg:leading-[1.35]">
              {pickText(siteConfig.heroTitle, lang)}
            </h1>
          </div>

          <p className="max-w-md text-[0.9375rem] leading-[1.95]" style={{ color: 'var(--text-muted)' }}>
            {pickText(siteConfig.heroIntro, lang)}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <Link href="/blog" className="cta-primary">
              {lang === 'zh' ? '阅读博客' : 'Blog'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/about" className="cta-secondary">
              {lang === 'zh' ? '关于我' : 'About'}
            </Link>
            <Link href={`mailto:${siteConfig.email}`} className="cta-secondary">
              <Mail className="h-3.5 w-3.5" />
              {lang === 'zh' ? '联系' : 'Contact'}
            </Link>
          </div>
        </div>
      </section>

      {/* 博客 */}
      <section>
        <p className="eyebrow">{lang === 'zh' ? '博客' : 'Blog'}</p>
        <h2
          className="mt-2 text-xl font-normal sm:text-[1.375rem]"
          style={{
            fontFamily: 'var(--font-title), serif',
            color: 'var(--text-bright)',
            lineHeight: 1.55,
          }}
        >
          {lang === 'zh' ? '最近写下的内容。' : 'Recent writing from the log.'}
        </h2>

        {recentPosts.length > 0 ? (
          <div className="mt-6 space-y-0">
            {recentPosts.map((post, idx) => {
              const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

              return (
                <div key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block py-5 hover-paper"
                    style={{ borderBottom: idx < recentPosts.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-normal transition-colors group-hover:text-[var(--accent)]" style={{ fontFamily: 'var(--font-title), serif' }}>
                          {post.title}
                        </h3>
                        {post.summary ? (
                          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-dim)' }}>
                            {post.summary}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                        <span className="date-note">
                          {formatDate(post.created_at, lang)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-dim)' }}>
                          <Eye className="h-3 w-3" />
                          {(post as Record<string, unknown>).view_count ?? 0}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                          {getReadingTimeLabel(readingTime, lang)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="hand-note mt-5">
            {lang === 'zh' ? '还没有公开的文章，写好了会出现在这里。' : 'No public posts yet. They\'ll appear here when ready.'}
          </p>
        )}

        <div className="mt-4">
          <Link href="/blog" className="cta-secondary text-sm">
            <NotebookPen className="h-3.5 w-3.5" />
            {lang === 'zh' ? '浏览全部博客 →' : 'Browse all →'}
          </Link>
        </div>
      </section>
    </div>
  )
}

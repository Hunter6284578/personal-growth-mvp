import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { homeEntryPoints, siteConfig } from '@/content/site'
import { getPublishedPosts } from '@/lib/blog'
import { formatDate, getReadingTimeLabel, pickText } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'

export const revalidate = 300

function stripMarkdown(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
    .replace(/[#>*_\-\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function HomePage() {
  const lang = await getCurrentLanguage()
  const posts = await getPublishedPosts()
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="space-y-12">
      <section className="archive-hero">
        <p className="eyebrow">{pickText(siteConfig.role, lang)}</p>
        <h1 className="mt-3 text-3xl leading-snug sm:text-4xl">
          {pickText(siteConfig.heroTitle, lang)}
        </h1>
        <p className="mt-5 text-base leading-8" style={{ color: 'var(--text-muted)' }}>
          {pickText(siteConfig.heroIntro, lang)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {siteConfig.heroFocus[lang].map((item) => (
            <span key={item} className="lab-chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="entry-grid">
        {homeEntryPoints.map((entry) => (
          <Link key={entry.href} href={entry.href} className="entry-link hover-paper">
            <span className="eyebrow">{pickText(entry.title, lang)}</span>
            <p className="mt-2 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              {pickText(entry.description, lang)}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--accent)' }}>
              {lang === 'zh' ? '进入' : 'Open'}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{lang === 'zh' ? '最近记录' : 'Recent Notes'}</p>
            <h2 className="mt-2 text-xl font-normal" style={{ color: 'var(--text-bright)' }}>
              {lang === 'zh' ? '新写下来的问题和答案。' : 'Fresh questions and answers.'}
            </h2>
          </div>
          <Link href="/blog" className="cta-secondary shrink-0">
            {lang === 'zh' ? '全部文章' : 'All writing'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-0">
          {recentPosts.length > 0 ? (
            recentPosts.map((post, idx) => {
              const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block py-5 hover-paper"
                  style={{ borderBottom: idx < recentPosts.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-3">
                        {post.category ? <span className="tag-active">{post.category}</span> : null}
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span key={`${post.id}-${tag}`} className="tag-minimal">#{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-base font-normal transition-colors group-hover:text-[var(--accent)]">
                        {post.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-dim)' }}>
                        {post.summary?.trim() || stripMarkdown(post.content).slice(0, 140)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3 text-xs sm:flex-col sm:items-end sm:gap-1.5 sm:pt-0.5">
                      <span className="date-note">
                        {formatDate(post.created_at, lang)}
                      </span>
                      <span style={{ color: 'var(--text-dim)' }}>
                        {getReadingTimeLabel(readingTime, lang)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <p className="hand-note mt-5">
              {lang === 'zh' ? '还没有公开文章，写好并发布后会出现在这里。' : 'No public posts yet. They will appear here after publishing.'}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

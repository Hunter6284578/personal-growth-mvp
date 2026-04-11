import type { Metadata } from 'next'
import Link from 'next/link'
import { Filter, Eye } from 'lucide-react'
import { getBlogTags, getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'
import { formatDate, getReadingTimeLabel } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLanguage()
  const isZh = lang === 'zh'

  return {
    title: isZh ? '日志' : 'Journal',
    description: isZh
      ? '记录项目、技术与阶段性思考的公开日志。'
      : 'A public journal of projects, technical notes, and periodic reflection.',
    alternates: {
      canonical: '/blog',
    },
  }
}

interface BlogPageProps {
  searchParams: Promise<{
    tag?: string
  }>
}

export const revalidate = 1800

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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const lang = await getCurrentLanguage()
  const { tag } = await searchParams
  const [posts, tags] = await Promise.all([getPublishedPosts(), getBlogTags()])

  const activeTag = tag?.trim() || ''
  const filteredPosts = activeTag
    ? posts.filter((post) => post.tags?.includes(activeTag))
    : posts

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '日志' : 'Journal'}
          title={lang === 'zh' ? '写下当下，留给未来。' : 'Writing down the present for the future.'}
          description={lang === 'zh' ? '这里的内容更像慢速笔记，而不是即时观点。' : 'The writing here feels more like slow notes than instant opinions.'}
        />

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 tag-minimal">
              <Filter className="h-3.5 w-3.5" />
            </span>
            <Link
              href="/blog"
              className={activeTag ? 'tag-minimal' : 'tag-active'}
            >
              {lang === 'zh' ? '全部' : 'All'}
            </Link>
            {tags.map((currentTag) => (
              <Link
                key={currentTag}
                href={`/blog?tag=${encodeURIComponent(currentTag)}`}
                className={currentTag === activeTag ? 'tag-active' : 'tag-minimal'}
              >
                #{currentTag}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-0">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, idx) => {
            const minutes = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block py-5 hover-paper"
                style={{ borderBottom: idx < filteredPosts.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2
                      className="text-base font-normal transition-colors group-hover:text-[var(--accent)]"
                      style={{ fontFamily: 'var(--font-title), serif', color: 'var(--text-bright)' }}
                    >
                      {post.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-dim)' }}>
                      {post.summary?.trim() || stripMarkdown(post.content).slice(0, 140) || (lang === 'zh' ? '这篇记录还没有补摘要，后续会继续完善。' : 'This note does not have a summary yet, but I may refine it later.')}
                    </p>
                    {post.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-3">
                        {post.tags.map((item) => (
                          <span key={`${post.id}-${item}`} className="tag-minimal">#{item}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                    <span className="date-note">
                      {formatDate(post.created_at, lang)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      {getReadingTimeLabel(minutes, lang)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="empty-state">
            {lang === 'zh' ? '当前标签下还没有内容，可以先回到全部文章看看其他记录。' : 'There is no content under this tag yet. You can go back to all notes and browse the rest.'}
          </div>
        )}
      </section>
    </div>
  )
}

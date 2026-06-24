import type { Metadata } from 'next'
import Link from 'next/link'
import { Filter, FolderOpen } from 'lucide-react'
import { getBlogCategories, getBlogTags, getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'
import { formatDate, getReadingTimeLabel } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLanguage()
  const isZh = lang === 'zh'

  return {
    title: isZh ? '博客' : 'Blog',
    description: isZh
      ? '所有公开文章。'
      : 'All public writing.',
    alternates: {
      canonical: '/blog',
    },
  }
}

interface BlogPageProps {
  searchParams: Promise<{
    category?: string
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
  const { category, tag } = await searchParams
  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getBlogCategories(),
    getBlogTags(),
  ])

  const activeCategory = category?.trim() || ''
  const activeTag = tag?.trim() || ''
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory ? post.category === activeCategory : true
    const matchesTag = activeTag ? post.tags?.includes(activeTag) : true
    return matchesCategory && matchesTag
  })

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '学习档案' : 'Learning Archive'}
          title={lang === 'zh' ? '按系列翻看学习过程。' : 'Browse the learning process by series.'}
          description={lang === 'zh' ? '系列是一篇文章的主线，标签是路上留下的小标记。' : 'A series is the main thread; tags are smaller markers along the way.'}
        />

        {(categories.length > 0 || tags.length > 0) && (
          <div className="filter-panel space-y-4">
            {categories.length > 0 ? (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 filter-label">
                  <FolderOpen className="h-3.5 w-3.5" />
                  {lang === 'zh' ? '系列' : 'Series'}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={activeTag ? `/blog?tag=${encodeURIComponent(activeTag)}` : '/blog'}
                    className={activeCategory ? 'series-link' : 'series-link-active'}
                  >
                    {lang === 'zh' ? '全部' : 'All'}
                  </Link>
                  {categories.map((currentCategory) => {
                    const href = activeTag
                      ? `/blog?category=${encodeURIComponent(currentCategory)}&tag=${encodeURIComponent(activeTag)}`
                      : `/blog?category=${encodeURIComponent(currentCategory)}`

                    return (
                      <Link
                        key={currentCategory}
                        href={href}
                        className={currentCategory === activeCategory ? 'series-link-active' : 'series-link'}
                      >
                        {currentCategory}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {tags.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 filter-label">
                  <Filter className="h-3.5 w-3.5" />
                  {lang === 'zh' ? '标签' : 'Tags'}
                </span>
                <Link
                  href={activeCategory ? `/blog?category=${encodeURIComponent(activeCategory)}` : '/blog'}
                  className={activeTag ? 'tag-minimal' : 'tag-active'}
                >
                  {lang === 'zh' ? '全部' : 'All'}
                </Link>
                {tags.map((currentTag) => {
                  const href = activeCategory
                    ? `/blog?category=${encodeURIComponent(activeCategory)}&tag=${encodeURIComponent(currentTag)}`
                    : `/blog?tag=${encodeURIComponent(currentTag)}`

                  return (
                    <Link
                      key={currentTag}
                      href={href}
                      className={currentTag === activeTag ? 'tag-active' : 'tag-minimal'}
                    >
                      #{currentTag}
                    </Link>
                  )
                })}
              </div>
            ) : null}
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
                      style={{ color: 'var(--text-bright)' }}
                    >
                      {post.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-dim)' }}>
                      {post.summary?.trim() || stripMarkdown(post.content).slice(0, 140) || (lang === 'zh' ? '这篇记录还没有补摘要，后续会继续完善。' : 'This note does not have a summary yet, but I may refine it later.')}
                    </p>
                    {post.category || post.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-3">
                        {post.category ? (
                          <span className="tag-active">{post.category}</span>
                        ) : null}
                        {post.tags?.map((item) => (
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
            {lang === 'zh' ? '当前筛选下还没有内容，可以先回到全部文章看看其他记录。' : 'There is no content under this filter yet. You can go back to all notes and browse the rest.'}
          </div>
        )}
      </section>
    </div>
  )
}

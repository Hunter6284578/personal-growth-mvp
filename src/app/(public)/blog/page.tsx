import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Clock3, Filter } from 'lucide-react'
import { blogThemes } from '@/content/site'
import { getBlogTags, getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'

export const metadata: Metadata = {
  title: 'Blog / Notes',
  description: '技术学习、项目复盘、成长记录和阶段总结。',
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
  const { tag } = await searchParams
  const [posts, tags] = await Promise.all([getPublishedPosts(), getBlogTags()])

  const activeTag = tag?.trim() || ''
  const filteredPosts = activeTag
    ? posts.filter((post) => post.tags?.includes(activeTag))
    : posts

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow="Blog / Notes"
          title="这里记录技术学习、项目复盘和阶段总结。"
          description="内容定位偏“可复盘的记录”，而不是松散流水账。列表按时间倒序展示，并支持按标签筛选。"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">公开文章</p>
            <p className="mt-3 text-3xl font-semibold text-stone-950">{posts.length}</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">按时间倒序呈现，优先放技术复盘和项目记录。</p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">标签数量</p>
            <p className="mt-3 text-3xl font-semibold text-stone-950">{tags.length}</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">标签用于快速筛选主题，不做复杂分类系统。</p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">当前主题</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {blogThemes.map((theme) => (
                <span key={theme} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
              <Filter className="h-4 w-4" />
              标签筛选
            </span>
            <Link
              href="/blog"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTag
                  ? 'bg-stone-100 text-stone-600 hover:text-stone-950'
                  : 'bg-stone-950 text-white'
              }`}
            >
              全部
            </Link>
            {tags.map((currentTag) => (
              <Link
                key={currentTag}
                href={`/blog?tag=${encodeURIComponent(currentTag)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentTag === activeTag
                    ? 'bg-stone-950 text-white'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-950'
                }`}
              >
                #{currentTag}
              </Link>
            ))}
          </div>
        </div>

        {posts.length < 3 ? (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-5 text-sm leading-7 text-stone-600">
            当前公开内容还偏少，这属于正常阶段。接下来更值得补的是项目拆解、踩坑复盘和阶段总结，而不是泛泛而谈的“学习日记”。
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(24,24,27,0.22)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                    {post.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-stone-600">
                    {post.summary?.trim() || stripMarkdown(post.content).slice(0, 140) || '这篇记录还没有补摘要，后续会继续完善。'}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-stone-500">
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {Math.max(1, Math.ceil((post.content?.length || 0) / 320))} 分钟阅读
                  </p>
                </div>
              </div>

              {post.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((item) => (
                    <span
                      key={`${post.id}-${item}`}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                    >
                      #{item}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-10 text-sm text-stone-500">
            当前标签下还没有内容。你可以先返回 <Link href="/blog" className="font-medium text-teal-700 hover:text-teal-600">全部文章</Link>，或者后续补一篇对应主题的记录。
          </div>
        )}
      </section>
    </div>
  )
}

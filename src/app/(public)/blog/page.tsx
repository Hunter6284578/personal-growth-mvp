import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Clock3, Filter } from 'lucide-react'
import { blogThemes } from '@/content/site'
import { getBlogTags, getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'
import { formatDate, getReadingTimeLabel, pickList } from '@/lib/site-language'
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
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow={lang === 'zh' ? '日志' : 'Journal'}
          title={lang === 'zh' ? '写下当下，留给未来。' : 'Writing down the present for the future.'}
          description={lang === 'zh' ? '这里的内容更像慢速笔记，而不是即时观点。' : 'The writing here feels more like slow notes than instant opinions.'}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '公开文章' : 'Published Notes'}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{posts.length}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{lang === 'zh' ? '按时间慢慢积累，不追求高频更新。' : 'Built slowly over time without chasing frequency.'}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '标签数量' : 'Tags'}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{tags.length}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{lang === 'zh' ? '标签帮助检索，不限定表达。' : 'Tags help navigation without limiting expression.'}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '常写主题' : 'Common Themes'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pickList(blogThemes, lang).map((theme) => (
                <span key={theme} className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-medium text-slate-300">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-slate-200">
              <Filter className="h-4 w-4" />
              {lang === 'zh' ? '标签筛选' : 'Tag Filter'}
            </span>
            <Link
              href="/blog"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTag
                  ? 'border border-white/10 bg-white/6 text-slate-300 hover:text-white'
                  : 'bg-emerald-400 text-slate-950'
              }`}
            >
              {lang === 'zh' ? '全部' : 'All'}
            </Link>
            {tags.map((currentTag) => (
              <Link
                key={currentTag}
                href={`/blog?tag=${encodeURIComponent(currentTag)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentTag === activeTag
                    ? 'bg-emerald-400 text-slate-950'
                    : 'border border-white/10 bg-white/6 text-slate-300 hover:text-white'
                }`}
              >
                #{currentTag}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lang === 'zh' ? '写作提醒' : 'Writing Reminder'}</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {lang === 'zh'
              ? '写正在发生的事，写真实的感受，写那些你愿意在一年后再读一遍的句子。'
              : 'Write what is actually happening, what you truly feel, and the sentences you would still want to read a year from now.'}
          </p>
        </div>

        {posts.length < 3 ? (
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/6 px-6 py-5 text-sm leading-7 text-slate-300">
            {lang === 'zh'
              ? '当前公开内容还偏少，这很正常。先写具体发生过的事，再慢慢补齐脉络。'
              : 'The amount of public writing is still small, and that’s normal. Start with concrete things that actually happened, then fill in the bigger picture over time.'}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const minutes = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.9)] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {post.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-slate-300">
                      {post.summary?.trim() || stripMarkdown(post.content).slice(0, 140) || (lang === 'zh' ? '这篇记录还没有补摘要，后续会继续完善。' : 'This note does not have a summary yet, but I may refine it later.')}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{lang === 'zh' ? '阶段记录' : 'Progress Log'}</p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <p className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(post.created_at, lang)}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {getReadingTimeLabel(minutes, lang)}
                    </p>
                  </div>
                </div>

                {post.tags?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((item) => (
                      <span
                        key={`${post.id}-${item}`}
                        className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-medium text-slate-300"
                      >
                        #{item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            )
          })
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/6 px-6 py-10 text-sm text-slate-400">
            {lang === 'zh' ? '当前标签下还没有内容，可以先回到全部文章看看其他记录。' : 'There is no content under this tag yet. You can go back to all notes and browse the rest.'}
          </div>
        )}
      </section>
    </div>
  )
}

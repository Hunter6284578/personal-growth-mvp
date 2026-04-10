import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, NotebookPen, Mail, Clock3 } from 'lucide-react'

import { siteConfig } from '@/content/site'
import { getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'
import { formatDate, getReadingTimeLabel, pickText } from '@/lib/site-language'

import { getCurrentLanguage } from '@/lib/site-language.server'

export const revalidate = 300

export default async function HomePage() {
  const lang = await getCurrentLanguage()
  const recentPosts = (await getPublishedPosts()).slice(0, 3)

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Hero */}
      <section className="hero-panel overflow-hidden">
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_58%)] lg:block" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-4">
                <p className="eyebrow">{siteConfig.title}</p>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                  {pickText(siteConfig.heroTitle, lang)}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                  {pickText(siteConfig.heroIntro, lang)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/projects" className="cta-primary text-base">
                {lang === 'zh' ? '查看作品' : 'View Projects'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/blog" className="cta-secondary text-base">
                {lang === 'zh' ? '阅读日志' : 'Read Journal'}
              </Link>
              <Link href={`mailto:${siteConfig.email}`} className="cta-secondary text-base">
                <Mail className="h-4 w-4" />
                {lang === 'zh' ? '联系我' : 'Contact'}
              </Link>
            </div>
          </div>

          <div className="surface-panel flex h-full flex-col justify-between p-6 lg:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/85">{lang === 'zh' ? '关于我' : 'About Me'}</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xl font-semibold text-white">{pickText(siteConfig.role, lang)}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{pickText(siteConfig.lookingFor, lang)}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="font-semibold text-white">Email: </span>{siteConfig.email}</p>
                  <p><span className="font-semibold text-white">GitHub: </span>{siteConfig.github}</p>
                  <p><span className="font-semibold text-white">{lang === 'zh' ? '定位: ' : 'Location: '}</span>{pickText(siteConfig.location, lang)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 transition hover:text-white">
                {lang === 'zh' ? '了解更多关于我' : 'Learn more about me'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="public-section space-y-8">
          <SectionHeading
            eyebrow={lang === 'zh' ? '精选作品' : 'Featured Projects'}
            title={lang === 'zh' ? '最近在构建的几个方向。' : 'A few things I\'ve been building recently.'}
          />
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 px-5 py-8 text-sm text-slate-400">
            {lang === 'zh' ? '暂无精选作品，敬请期待。' : 'No featured projects yet. Stay tuned.'}
          </div>
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white">
            {lang === 'zh' ? '查看完整项目页' : 'View all projects'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="public-section space-y-6">
          <SectionHeading
            eyebrow={lang === 'zh' ? '我在聚焦什么' : 'What I\'m Focused On'}
            title={lang === 'zh' ? '构建、学习、反思。' : 'Building, learning, reflecting.'}
          />
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 px-5 py-8 text-sm text-slate-400">
            {lang === 'zh' ? '暂无内容，待添加。' : 'No content yet. Coming soon.'}
          </div>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="public-section space-y-6">
          <SectionHeading
            eyebrow={lang === 'zh' ? '最近日志' : 'Latest Notes'}
            title={lang === 'zh' ? '最近写下的内容。' : 'Recent writing from the log.'}
            description={lang === 'zh' ? '技术、项目、以及阶段性的自我复盘。' : 'Notes on tech, projects, and periodic reflection.'}
          />
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => {
                const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 transition hover:border-white/20 hover:-translate-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      <span className="metric-font text-xs text-slate-500">{formatDate(post.created_at, lang)}</span>
                    </div>
                    {post.summary ? <p className="mt-3 text-sm leading-6 text-slate-300">{post.summary}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {getReadingTimeLabel(readingTime, lang)}
                      </span>
                    </div>
                    {post.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={`${post.id}-${tag}`} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 px-5 py-8 text-sm text-slate-400">
              {lang === 'zh' ? '暂时还没有新的公开文章。' : 'No public notes yet.'}
            </div>
          )}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white">
            <NotebookPen className="h-4 w-4" />
            {lang === 'zh' ? '浏览全部日志' : 'Browse all notes'}
          </Link>
        </section>

        <section className="public-section">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-4">
              <p className="eyebrow">{lang === 'zh' ? '关于我' : 'About Me'}</p>
              <h2 className="text-3xl font-semibold text-white">
                {lang === 'zh' ? '我在做项目，也在认真经营自己的成长。' : 'I build projects and take my growth seriously.'}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-300">
                {lang === 'zh'
                  ? '如果你想快速了解我，可以从关于页开始；如果你更关心能力和思考方式，就直接去看项目和日志。'
                  : 'If you want a quick sense of who I am, start with the about page. If you care more about capability and thinking, jump straight to projects and journal.'}
              </p>
            </div>
            <div className="surface-panel p-6">
              <div className="flex flex-wrap gap-3">
                <Link href="/about" className="cta-primary">
                  {lang === 'zh' ? '更多关于我' : 'Learn more'}
                </Link>
                <Link href="/projects" className="cta-secondary">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {lang === 'zh' ? '项目总览' : 'Project overview'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}

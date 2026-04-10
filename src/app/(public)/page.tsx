import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, NotebookPen, Mail } from 'lucide-react'
import { siteConfig, featuredProjects, skillGroups } from '@/content/site'
import { getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'
import { ProjectCard } from '@/components/site/ProjectCard'
import { SkillGroupCard } from '@/components/site/SkillGroupCard'

export const revalidate = 300

export default async function HomePage() {
  const recentPosts = (await getPublishedPosts()).slice(0, 3)

  return (
    <div className="space-y-8">
      <section className="public-section overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="eyebrow">30 秒说服路径</p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
                我是能把需求变成可运行交付的全栈实践者。
              </h1>
              <p className="max-w-3xl text-base leading-8 text-stone-600">{siteConfig.heroIntro}</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {siteConfig.heroFocus.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-stone-200 bg-stone-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">我是谁</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">前端 / 全栈方向求职者</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">我解决什么</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">个人站、内容系统、数据记录闭环</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">为何值得面试</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">有线上交付与复盘证据</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-5 py-3 text-sm font-medium text-white">
                看项目证据
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-950 hover:text-stone-950">
                看岗位匹配信息
              </Link>
              <Link href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-950 hover:text-stone-950">
                <Mail className="h-4 w-4" />
                联系我
              </Link>
            </div>
          </div>

          <div className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">当前状态</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-lg font-semibold text-stone-950">{siteConfig.role}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{siteConfig.lookingFor}</p>
              </div>
              <div className="space-y-3 rounded-lg bg-stone-100/90 p-4">
                {siteConfig.now.map((item) => (
                  <p key={item} className="text-sm leading-6 text-stone-700">
                    • {item}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-stone-600">
                <span className="rounded-md border border-stone-200 bg-white px-3 py-1">{siteConfig.location}</span>
                <span className="rounded-md border border-stone-200 bg-white px-3 py-1">可持续维护</span>
                <span className="rounded-md border border-stone-200 bg-white px-3 py-1">内容沉淀</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section space-y-8">
          <SectionHeading
            eyebrow="Featured Work"
            title="先看证据，再看描述。"
            description="每个项目都包含职责边界、技术取舍、可验证证据与结果指标。"
          />
        <div className="grid gap-6">
          {featuredProjects.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={project} compact />
          ))}
        </div>
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950">
          查看完整项目页
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="public-section space-y-8">
          <SectionHeading eyebrow="Core Skills" title="能力结构" description="关注可交付与可协作能力，不只罗列名词。"/>
          <div className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((group) => (
              <SkillGroupCard key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </div>

        <section className="public-section space-y-6">
          <SectionHeading eyebrow="Recent Notes" title="最近在沉淀什么" description="只保留问题复盘、技术决策、上线记录三类内容。"/>
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-lg border border-stone-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-stone-950">{post.title}</h3>
                    <span className="metric-font text-xs text-stone-500">{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                      {post.summary ? <p className="mt-3 text-sm leading-6 text-stone-600">{post.summary}</p> : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                        结构：背景 {`->`} 方案 {`->`} 踩坑 {`->`} 结果 {`->`} 复用结论
                      </p>
                  {post.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={`${post.id}-${tag}`} className="rounded-md border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white px-5 py-8 text-sm text-stone-500">
              暂无可公开复盘。新内容会优先补上线记录和技术决策。
            </div>
          )}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950">
            <NotebookPen className="h-4 w-4" />
            浏览全部 Notes
          </Link>
        </section>
      </section>

      <section className="public-section">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="eyebrow">Contact</p>
            <h2 className="text-3xl font-semibold text-stone-950">如果你在评估我，建议先看项目页与博客复盘。</h2>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              这不是一次性包装页，而是持续维护的线上证据库。
            </p>
          </div>
          <div className="surface-panel p-6">
            <div className="space-y-3 text-sm text-stone-600">
              <p><span className="font-semibold text-stone-950">Email：</span>{siteConfig.email}</p>
              <p><span className="font-semibold text-stone-950">GitHub：</span>{siteConfig.github}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-5 py-3 text-sm font-medium text-white">
                邮件联系
              </Link>
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700">
                <BriefcaseBusiness className="h-4 w-4" />
                项目总览
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

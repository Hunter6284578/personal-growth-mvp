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
              <p className="eyebrow">CagedSheep</p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
                在有限之境，写下仍愿意回看的东西。
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
                <p className="mt-2 text-sm font-semibold text-stone-950">一个正在生活和创作的人</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">这里有什么</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">作品、文字、以及缓慢更新的日常</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">为什么继续做</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">为了留住会被时间冲走的片段</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-5 py-3 text-sm font-medium text-white">
                看作品
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-950 hover:text-stone-950">
                关于我
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
            eyebrow="作品"
            title="作品与阶段片段。"
            description="不是完美陈列，只是此刻真实在做的事。"
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
          <SectionHeading eyebrow="日常结构" title="我如何与日子相处。" description="写作、拍摄、整理、复盘。"/>
          <div className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((group) => (
              <SkillGroupCard key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </div>

        <section className="public-section space-y-6">
          <SectionHeading eyebrow="最近文字" title="最近写下的东西" description="不追求高产，只记录真正想留下的内容。"/>
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
                        一次片段，一次回看
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
              暂时还没有新的公开文章。
            </div>
          )}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950">
            <NotebookPen className="h-4 w-4" />
            浏览全部文字
          </Link>
        </section>
      </section>

      <section className="public-section">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="eyebrow">联系</p>
            <h2 className="text-3xl font-semibold text-stone-950">如果你也偏爱慢一点的表达，欢迎联系我。</h2>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              这里会持续更新，像一封不断续写的长信。
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

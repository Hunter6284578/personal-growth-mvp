import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, NotebookPen, Dumbbell, Mail } from 'lucide-react'
import { siteConfig, featuredProjects, skillGroups, homeSignals, fitnessCapabilities } from '@/content/site'
import { getPublishedPosts } from '@/lib/blog'
import { SectionHeading } from '@/components/site/SectionHeading'
import { SignalCard } from '@/components/site/SignalCard'
import { ProjectCard } from '@/components/site/ProjectCard'
import { SkillGroupCard } from '@/components/site/SkillGroupCard'

export const revalidate = 300

export default async function HomePage() {
  const recentPosts = (await getPublishedPosts()).slice(0, 3)

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section overflow-hidden">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <p className="eyebrow">Job-Oriented Personal Site</p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
                用项目、记录和持续迭代证明我能把事情做成。
              </h1>
              <p className="max-w-3xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                {siteConfig.heroIntro}
              </p>
              <p className="max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
                当前目标是把这个站点打造成简历的补充入口：别人能快速知道我是谁、我做过什么、我在持续沉淀什么，以及我为什么值得进一步沟通。
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {siteConfig.heroFocus.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {siteConfig.targetRoles.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">求职方向</p>
                  <p className="mt-2 text-sm font-semibold text-stone-950">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                看代表项目
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
              >
                查看 Resume
              </Link>
              <Link
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
              >
                <Mail className="h-4 w-4" />
                联系我
              </Link>
            </div>
          </div>

          <div className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              当前状态
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-lg font-semibold text-stone-950">{siteConfig.role}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{siteConfig.lookingFor}</p>
              </div>
              <div className="space-y-3 rounded-3xl bg-stone-100/90 p-5">
                {siteConfig.now.map((item) => (
                  <p key={item} className="text-sm leading-6 text-stone-700">
                    • {item}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-stone-600">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">{siteConfig.location}</span>
                <span className="rounded-full bg-stone-100 px-3 py-1">可持续维护</span>
                <span className="rounded-full bg-stone-100 px-3 py-1">内容沉淀</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {homeSignals.map((signal) => (
          <SignalCard key={signal.label} label={signal.label} value={signal.value} />
        ))}
      </section>

      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow="Featured Work"
          title="先用项目说话，再谈能力。"
          description="优先展示项目背景、我负责什么、最后交付了什么。这样招聘方能先看到结果，再回头判断技术深度。"
        />
        <div className="grid gap-6">
          {featuredProjects.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={project} compact />
          ))}
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
        >
          查看完整项目页
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="public-section space-y-8">
          <SectionHeading
            eyebrow="Core Skills"
            title="技术栈之外，也关注工程边界和表达效率。"
            description="这个站点会长期承载求职展示、博客、健身记录和 AI 接入，所以我优先考虑模块职责清晰和后续扩展成本。"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((group) => (
              <SkillGroupCard key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="public-section space-y-6">
            <SectionHeading
              eyebrow="Recent Notes"
              title="最近在沉淀什么"
              description="博客和记录不是装饰，而是用来展示学习路径、项目复盘和思考质量。"
            />
            {recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block rounded-3xl border border-stone-200 bg-white p-5 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-stone-950">{post.title}</h3>
                      <span className="metric-font text-xs text-stone-500">
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {post.summary ? (
                      <p className="mt-3 text-sm leading-6 text-stone-600">{post.summary}</p>
                    ) : null}
                    {post.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${post.id}-${tag}`}
                            className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-5 py-8 text-sm text-stone-500">
                文章内容还在补充，但结构已经按“技术学习 / 项目复盘 / 阶段总结”准备好，后续会逐步把记录密度拉起来。
              </div>
            )}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
            >
              <NotebookPen className="h-4 w-4" />
              浏览全部 Notes
            </Link>
          </section>

          <section className="public-section space-y-6">
            <SectionHeading
              eyebrow="Fitness Module"
              title="健身模块的意义不是炫耀，而是展示自律和数据意识。"
              description="它在整站中是辅助线：不喧宾夺主，但能体现长期记录习惯、目标管理和 AI 接入能力。"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {fitnessCapabilities.map((item) => (
                <div key={item.title} className="rounded-3xl border border-stone-200 bg-white p-5">
                  <p className="text-base font-semibold text-stone-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/fitness"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
              >
                <Dumbbell className="h-4 w-4" />
                查看 Fitness 页面
              </Link>
              <Link
                href="/fit"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
              >
                进入私密记录工作台
              </Link>
            </div>
          </section>
        </div>
      </section>

      <section className="public-section">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="eyebrow">Contact</p>
            <h2 className="text-3xl font-semibold text-stone-950">
              如果你在看的是简历补充页，这里就是下一步入口。
            </h2>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              目前这个站点更像一个持续迭代中的产品样本，而不是一次性包装页。它会继续累积项目、文章、训练数据和 AI 模块。
            </p>
          </div>
          <div className="surface-panel p-6">
            <div className="space-y-3 text-sm text-stone-600">
              <p>
                <span className="font-semibold text-stone-950">Email：</span>
                {siteConfig.email}
              </p>
              <p>
                <span className="font-semibold text-stone-950">GitHub：</span>
                {siteConfig.github}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
              >
                邮件联系
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
              >
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

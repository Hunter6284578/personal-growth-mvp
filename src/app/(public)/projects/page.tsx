import type { Metadata } from 'next'
import { featuredProjects } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { ProjectCard } from '@/components/site/ProjectCard'
import { getCurrentLanguage } from '@/lib/site-language.server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLanguage()
  const isZh = lang === 'zh'

  return {
    title: isZh ? '作品' : 'Projects',
    description: isZh
      ? '查看我持续构建的项目、阶段性成果与过程记录。'
      : 'Explore the projects I am building, including stage-based outcomes and process notes.',
    alternates: {
      canonical: '/projects',
    },
  }
}

export const revalidate = 86400

export default async function ProjectsPage() {
  const lang = await getCurrentLanguage()

  const maintenanceItems = lang === 'zh'
    ? [
        { title: '持续记录', description: '记录阶段变化，而不是只展示结果。' },
        { title: '定期整理', description: '让每个项目都带着上下文，而不是一张孤立截图。' },
        { title: '不过度包装', description: '保留真实的取舍、犹豫与迭代痕迹。' },
        { title: '保留线索', description: '把文档、链接、版本与复盘一起保存下来。' },
        { title: '反复回看', description: '从旧项目里看见下一个阶段应该修正什么。' },
        { title: '长期更新', description: '不追求一口气做完，追求不断线。' },
      ]
    : [
        { title: 'Document Continuously', description: 'I record change over time instead of showing only final outcomes.' },
        { title: 'Organize Regularly', description: 'Each project keeps its context instead of becoming an isolated screenshot.' },
        { title: 'Avoid Over-packaging', description: 'I keep the trade-offs, hesitation, and iteration visible.' },
        { title: 'Preserve Context', description: 'Docs, links, versions, and reflections stay together.' },
        { title: 'Review Repeatedly', description: 'Older work often shows what the next stage should improve.' },
        { title: 'Update for the Long Term', description: 'I care less about finishing in one burst and more about staying in motion.' },
      ]

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/85">{lang === 'zh' ? '阅读建议' : 'How to Read This'}</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            {lang === 'zh'
              ? '把这些内容当作项目手记：它们不一定完美，但都来自真实阶段。'
              : 'Treat these as project notes. They may not be perfect, but they come from real stages of work.'}
          </p>
        </div>
        <SectionHeading
          eyebrow={lang === 'zh' ? '作品' : 'Projects'}
          title={lang === 'zh' ? '我做过的事，和仍在继续的事。' : 'Things I’ve built, and things I’m still building.'}
          description={lang === 'zh' ? '这里放的是阶段性成果与思考过程，不是假装完整的终极答案。' : 'What you see here are stage-based outcomes and thought processes, not polished final answers.'}
        />
        <div className="grid gap-6">
          {featuredProjects.map((project) => (
            <div key={project.slug} id={project.slug}>
              <ProjectCard project={project} lang={lang} />
            </div>
          ))}
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '维护方式' : 'How I Maintain Work'}
          title={lang === 'zh' ? '我如何维护这些项目。' : 'How I keep these projects alive.'}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {maintenanceItems.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

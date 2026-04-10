import type { Metadata } from 'next'
import { featuredProjects } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { ProjectCard } from '@/components/site/ProjectCard'

export const metadata: Metadata = {
  title: 'Works',
  description: '作品与阶段片段。',
}

export const revalidate = 86400

export default function ProjectsPage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">阅读建议</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            把这些内容当作作品手记：它们并不完美，但都来自真实阶段。
          </p>
        </div>
        <SectionHeading
          eyebrow="Works"
          title="我做过的事，和仍在继续的事。"
          description="这里放的是阶段性的作品，不是终极答案。"
        />
        <div className="grid gap-6">
          {featuredProjects.map((project) => (
            <div key={project.slug} id={project.slug}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow="How I Keep Them"
          title="我如何维护这些作品。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: '持续记录',
              description: '记录阶段变化，而不是只记录结果。',
            },
            {
              title: '定期整理',
              description: '让每个作品都有可回看的上下文。',
            },
            {
              title: '不过度包装',
              description: '保留过程中的不完美与犹豫。',
            },
            {
              title: '保留证据',
              description: '让文字、链接和版本共同构成记忆。',
            },
            {
              title: '反复回看',
              description: '从旧作品里看见下一步方向。',
            },
            {
              title: '长期更新',
              description: '不急于完成，只保持不断线。',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-stone-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-stone-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import { featuredProjects } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { ProjectCard } from '@/components/site/ProjectCard'

export const metadata: Metadata = {
  title: 'Projects',
  description: '展示项目背景、技术栈、职责、难点和结果。',
}

export const revalidate = 86400

export default function ProjectsPage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">阅读建议</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            每个项目按同一顺序阅读：背景 {`->`} 职责边界 {`->`} 难点取舍 {`->`} 结果指标 {`->`} 证据链接。
          </p>
        </div>
        <SectionHeading
          eyebrow="Projects"
          title="项目页只回答一件事：你是否真的交付过。"
          description="每个项目默认包含职责边界、关键取舍、可验证证据与结果指标，避免空话。"
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
          eyebrow="Evidence Checklist"
          title="新增项目时，请先补齐这 6 条证据。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: '上线地址',
              description: '有可访问链接，或可运行仓库与启动说明。',
            },
            {
              title: '职责边界',
              description: '明确你独立负责与协作部分，避免“全包式”叙述。',
            },
            {
              title: '难点与取舍',
              description: '说明限制条件、替代方案和最终决策理由。',
            },
            {
              title: '结果指标',
              description: '给出可量化结果：性能、交付周期、功能覆盖等。',
            },
            {
              title: '复盘结论',
              description: '总结可迁移经验，体现你能持续优化。',
            },
            {
              title: '持续状态',
              description: '标注当前状态：运行中、迭代中、已归档。',
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

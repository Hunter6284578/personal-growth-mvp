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
        <SectionHeading
          eyebrow="Projects"
          title="项目页重点回答三件事：做了什么、解决了什么、体现了什么能力。"
          description="目前先把已有个人站模块拆成三个代表方向展示，后续你可以直接在 `src/content/site.ts` 里替换成真实项目。"
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
          eyebrow="How To Extend"
          title="后续补充真实项目时，优先补四类信息。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: '项目背景',
              description: '为什么做、面向谁、核心问题是什么。',
            },
            {
              title: '我的职责',
              description: '你负责了哪些模块，做的是主导还是协作。',
            },
            {
              title: '难点与取舍',
              description: '遇到了什么限制，为什么这样设计。',
            },
            {
              title: '结果与证明',
              description: '上线、指标、截图、Demo、文档或 GitHub 链接。',
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

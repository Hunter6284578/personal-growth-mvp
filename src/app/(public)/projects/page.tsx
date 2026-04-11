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

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="space-y-8">
        <SectionHeading
          eyebrow={lang === 'zh' ? '作品' : 'Projects'}
          title={lang === 'zh' ? '我做过的事，和仍在继续的事。' : "Things I've built, and things I'm still building."}
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
    </div>
  )
}

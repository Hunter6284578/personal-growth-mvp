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
      ? '一些项目和阶段性整理。'
      : 'A few projects and notes about them.',
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
          title={lang === 'zh' ? '一些做过、正在做、还在想的东西。' : 'Things made, being made, or still being thought through.'}
          description={lang === 'zh' ? '这里不是项目经历表，更像一个作品架：先放下痕迹，再慢慢补全故事。' : 'This is not a resume table. It is more like a shelf: traces first, stories later.'}
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

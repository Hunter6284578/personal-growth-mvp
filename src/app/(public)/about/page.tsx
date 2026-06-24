import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { siteConfig, skillGroups } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { pickList, pickText } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLanguage()
  const isZh = lang === 'zh'

  return {
    title: isZh ? '关于' : 'About',
    description: isZh
      ? '关于 Hunter 和这个 AI 学习档案。'
      : 'About Hunter and this AI learning archive.',
    alternates: {
      canonical: '/about',
    },
  }
}

export const revalidate = 86400

export default async function AboutPage() {
  const lang = await getCurrentLanguage()

  return (
    <div className="space-y-10">
      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '关于' : 'About'}
          title={lang === 'zh' ? '关于我，和这个网站。' : 'About me, and this site.'}
        />
        <div className="max-w-2xl space-y-5">
          <p className="text-base leading-7" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh'
              ? '我是 Hunter，目前是生物医学工程大二学生，对深度学习、大模型，以及 AI 在医学健康场景里的应用很感兴趣。'
              : "I'm Hunter, a sophomore studying biomedical engineering, interested in deep learning, LLMs, and AI in health contexts."}
          </p>
          <p className="text-base leading-7" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh'
              ? '这个网站是我的公开学习档案：放 Bug 复盘、技术笔记、项目实验和一些还没完全想清楚的问题。比起塞进很多模块，我更想让它保持安静、清楚、好维护。'
              : 'This site is my public learning archive for bug reviews, technical notes, project experiments, and questions still becoming clear. Instead of packing it with modules, I want it quiet, clear, and easy to maintain.'}
          </p>
          <p className="text-base leading-7" style={{ color: 'var(--text-muted)' }}>
            {pickText(siteConfig.lookingFor, lang)}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href={`mailto:${siteConfig.email}`}
            className="cta-primary"
          >
            <Mail className="h-4 w-4" />
            {siteConfig.email}
          </Link>
          <Link
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="cta-secondary"
          >
            GitHub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '聚焦方向' : 'Focus'}
          title={lang === 'zh' ? '医工、AI、问题记录。' : 'Biomedical engineering, AI, and problem notes.'}
        />
        <div className="space-y-5">
          {skillGroups.map((group) => (
            <div key={pickText(group.title, lang)}>
              <h3 className="text-sm font-normal" style={{ color: 'var(--text-bright)' }}>
                {pickText(group.title, lang)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {pickList(group.items, lang).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="hand-note">
          {lang === 'zh'
            ? '如果你愿意，可以继续看作品和博客。'
            : "If you'd like, the best next step is to explore the projects and blog."}
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href="/projects" className="cta-secondary text-sm">
            {lang === 'zh' ? '看作品 →' : 'View projects →'}
          </Link>
          <Link href="/blog" className="cta-secondary text-sm">
            {lang === 'zh' ? '看日志 →' : 'Read journal →'}
          </Link>
        </div>
      </section>
    </div>
  )
}

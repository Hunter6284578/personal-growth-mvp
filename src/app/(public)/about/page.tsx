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
      ? '关于 Hunter、这个网站，以及我为什么持续公开构建。'
      : 'About Hunter, this website, and why I keep building in public.',
    alternates: {
      canonical: '/about',
    },
  }
}

export const revalidate = 86400

export default async function AboutPage() {
  const lang = await getCurrentLanguage()

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '关于' : 'About'}
          title={lang === 'zh' ? '关于我，和我为什么做这个网站。' : "About me, and why I'm building this site."}
        />
        <div className="max-w-2xl space-y-5">
          <p className="text-base leading-7" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh'
              ? '我是 Hunter，对 Web 开发、个人系统和长期成长感兴趣。我更相信持续构建与长期记录，而不是短期冲刺。'
              : "I'm Hunter, interested in web development, personal systems, and long-term growth. I believe more in consistent building and documentation than short bursts of intensity."}
          </p>
          <p className="text-base leading-7" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh'
              ? '这个网站是我的公开空间：放项目、放思考，也记录自己如何一步步把想法变成现实。比起展示"我会什么"，我更想说明我在意什么、如何做事。'
              : 'This site is my public space for projects, reflections, and the process of turning ideas into reality. More than listing skills, I want to show what I care about and how I work.'}
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
          title={lang === 'zh' ? '构建、学习、反思。' : 'Building, learning, reflecting.'}
        />
        <div className="space-y-5">
          {skillGroups.map((group) => (
            <div key={pickText(group.title, lang)}>
              <h3 className="text-sm font-normal" style={{ color: 'var(--text-bright)', fontFamily: 'var(--font-title), serif' }}>
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
            ? '如果你愿意，可以继续看作品和日志。'
            : "If you'd like, the best next step is to explore the projects and journal."}
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

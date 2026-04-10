import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Download, Mail } from 'lucide-react'
import { resumeBlocks, siteConfig, skillGroups, timeline } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { SkillGroupCard } from '@/components/site/SkillGroupCard'
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
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow={lang === 'zh' ? '关于' : 'About'}
          title={lang === 'zh' ? '关于我，和我为什么做这个网站。' : 'About me, and why I’m building this site.'}
          description={lang === 'zh' ? '比起“我会什么”，我更想说明我在意什么、如何做事。' : 'More than listing skills, I want to show what I care about and how I work.'}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
            <p className="text-2xl font-semibold text-white">{siteConfig.title}</p>
            <p className="mt-2 text-base text-slate-300">{pickText(siteConfig.role, lang)}</p>
            <p className="mt-5 text-base leading-7 text-slate-300">{pickText(siteConfig.description, lang)}</p>
            <p className="mt-4 text-base leading-7 text-slate-300">{pickText(siteConfig.lookingFor, lang)}</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300/85">
              {lang === 'zh' ? '联系方式' : 'Contact'}
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Email: </span>
                {siteConfig.email}
              </p>
              <p>
                <span className="font-semibold text-white">GitHub: </span>
                {siteConfig.github}
              </p>
              <p>
                <span className="font-semibold text-white">{lang === 'zh' ? '当前状态: ' : 'Status: '}</span>
                {lang === 'zh' ? '持续更新中' : 'Actively evolving'}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
              >
                <Mail className="h-4 w-4" />
                {lang === 'zh' ? '邮件联系' : 'Send an email'}
              </Link>
              {siteConfig.resumeUrl ? (
                <Link
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-100"
                >
                  <Download className="h-4 w-4" />
                  {lang === 'zh' ? '下载简历' : 'Download resume'}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/15 px-5 py-3 text-sm text-slate-400">
                  <Download className="h-4 w-4" />
                  {lang === 'zh' ? '暂不提供简历下载' : 'Resume download is not available yet'}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="public-section space-y-6">
          <SectionHeading
            eyebrow={lang === 'zh' ? '片段' : 'Fragments'}
            title={lang === 'zh' ? '一些更接近我本人的信息。' : 'A few things that feel closer to who I am.'}
          />
          <div className="space-y-4">
            {resumeBlocks.map((block) => (
              <div key={pickText(block.title, lang)} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
                <h3 className="text-lg font-semibold text-white">{pickText(block.title, lang)}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
                  {pickList(block.items, lang).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="public-section space-y-6">
          <SectionHeading
            eyebrow={lang === 'zh' ? '技能地图' : 'Skill Map'}
            title={lang === 'zh' ? '我目前的能力结构。' : 'How my current capabilities are structured.'}
            description={lang === 'zh' ? '前端开发、AI 工作流、内容表达与长期系统。' : 'Frontend development, AI workflows, content expression, and long-term systems.'}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((group) => (
              <SkillGroupCard
                key={pickText(group.title, lang)}
                title={pickText(group.title, lang)}
                items={pickList(group.items, lang)}
                countLabel={lang === 'zh' ? '项' : 'items'}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '成长轨迹' : 'Growth Timeline'}
          title={lang === 'zh' ? '一些正在发生的节点。' : 'A few milestones that are currently taking shape.'}
          description={lang === 'zh' ? '我希望这个网站记录变化，而不是只展示一个静态版本的我。' : 'I want this site to record change, not just display a static version of myself.'}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {timeline.map((item) => (
            <div key={pickText(item.title, lang)} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
              <p className="metric-font text-sm text-emerald-300/85">{pickText(item.year, lang)}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{pickText(item.title, lang)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{pickText(item.description, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">{lang === 'zh' ? '下一步' : 'Next Step'}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {lang === 'zh' ? '如果你愿意，可以继续看作品和日志。' : 'If you’d like, the best next step is to explore the projects and journal.'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
            >
              {lang === 'zh' ? '看作品' : 'View projects'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-100"
            >
              {lang === 'zh' ? '看日志' : 'Read journal'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Download, Mail } from 'lucide-react'
import { resumeBlocks, siteConfig, skillGroups, timeline } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { SkillGroupCard } from '@/components/site/SkillGroupCard'

export const metadata: Metadata = {
  title: 'About / Resume',
  description: '教育背景、技能栈、项目方向和联系方式。',
}

export const revalidate = 86400

export default function AboutPage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow="About / Resume"
          title="信息组织偏简历视角，而不是自我感动视角。"
          description="这一页尽量回答四个问题：我是谁、我在做什么、我具备哪些能力、为什么值得进一步沟通。"
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <p className="text-2xl font-semibold text-stone-950">{siteConfig.name}</p>
            <p className="mt-2 text-base text-teal-700">{siteConfig.role}</p>
            <p className="mt-5 text-base leading-7 text-stone-600">{siteConfig.description}</p>
            <p className="mt-4 text-base leading-7 text-stone-600">{siteConfig.lookingFor}</p>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              联系方式
            </p>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <p>
                <span className="font-semibold text-stone-950">Email：</span>
                {siteConfig.email}
              </p>
              <p>
                <span className="font-semibold text-stone-950">GitHub：</span>
                {siteConfig.github}
              </p>
              <p>
                <span className="font-semibold text-stone-950">当前状态：</span>
                寻找实习 / 校招机会
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
              >
                <Mail className="h-4 w-4" />
                邮件联系
              </Link>
              {siteConfig.resumeUrl ? (
                <Link
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
                >
                  <Download className="h-4 w-4" />
                  下载简历
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-stone-300 px-5 py-3 text-sm text-stone-500">
                  <Download className="h-4 w-4" />
                  在 `src/content/site.ts` 中补充简历链接
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="public-section space-y-6">
          <SectionHeading
            eyebrow="Resume Blocks"
            title="把求职最需要看到的信息放在前面。"
          />
          <div className="space-y-4">
            {resumeBlocks.map((block) => (
              <div key={block.title} className="rounded-[2rem] border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-stone-950">{block.title}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-stone-600">
                  {block.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="public-section space-y-6">
          <SectionHeading
            eyebrow="Skill Stack"
            title="技能栈按协作与落地能力来组织。"
            description="不只罗列框架名，也强调我当前能独立完成的事情：结构设计、页面搭建、数据表单、内容管理、AI API 接入和后续维护。"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((group) => (
              <SkillGroupCard key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow="Growth Timeline"
          title="成长轨迹会继续更新，但表达方式保持专业。"
          description="这部分不是抒情，而是说明我当前在系统化积累哪些能力。"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {timeline.map((item) => (
            <div key={`${item.year}-${item.title}`} className="rounded-[2rem] border border-stone-200 bg-white p-6">
              <p className="metric-font text-sm text-teal-700">{item.year}</p>
              <h3 className="mt-3 text-lg font-semibold text-stone-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Next Step</p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-950">
              更详细的能力证明放在 Projects 和 Notes。
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
            >
              查看项目页
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
            >
              浏览 Notes
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

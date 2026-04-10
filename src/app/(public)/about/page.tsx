import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Download, Mail } from 'lucide-react'
import { resumeBlocks, siteConfig, skillGroups, timeline } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { SkillGroupCard } from '@/components/site/SkillGroupCard'

export const metadata: Metadata = {
  title: '关于',
  description: '关于我。',
}

export const revalidate = 86400

export default function AboutPage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow="关于"
          title="关于我，和我为什么写这个站点。"
          description="比起“我会什么”，我更想说“我在意什么”。"
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <p className="text-2xl font-semibold text-stone-950">{siteConfig.name}</p>
            <p className="mt-2 text-base text-stone-600">{siteConfig.role}</p>
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
                持续更新中
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
                  暂不提供简历下载
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="public-section space-y-6">
          <SectionHeading
            eyebrow="片段"
            title="一些更接近我本人的片段。"
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
            eyebrow="日常结构"
            title="我的日常结构。"
            description="写作、整理、创作和慢慢更新。"
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
            eyebrow="近况"
            title="一些正在发生的事。"
            description="不做宏大叙事，只记录真实阶段。"
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
            <p className="eyebrow">下一步</p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-950">
              如果你愿意，可以继续看作品和文字。
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
            >
              看作品
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
            >
              看文字
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

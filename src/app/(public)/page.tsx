import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, NotebookPen, Mail, Clock3 } from 'lucide-react'

import { siteConfig } from '@/content/site'
import { getPublishedPosts } from '@/lib/blog'
import { getPublicSkillGroups } from '@/lib/public-data'
import { SectionHeading } from '@/components/site/SectionHeading'
import { formatDate, getReadingTimeLabel, pickText } from '@/lib/site-language'

import { getCurrentLanguage } from '@/lib/site-language.server'

export const revalidate = 300

export default async function HomePage() {
  const lang = await getCurrentLanguage()
  const recentPosts = (await getPublishedPosts()).slice(0, 3)
  const skillGroups = await getPublicSkillGroups()

  return (
    <div className="space-y-16 lg:space-y-28">
      {/* Hero — 留白 + 个人痕迹 */}
      <section>
        <div className="space-y-8">
          <div>
            <p className="eyebrow">{siteConfig.title}</p>
            <h1 className="mt-3 text-3xl leading-snug sm:text-4xl lg:text-[2.75rem] lg:leading-[1.35]">
              {pickText(siteConfig.heroTitle, lang)}
            </h1>
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_180px] lg:gap-12">
            <div className="space-y-5">
              <p className="max-w-md text-[0.9375rem] leading-[1.95]" style={{ color: 'var(--text-muted)' }}>
                {pickText(siteConfig.heroIntro, lang)}
              </p>
              <span className="accent-line" />
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <Link href="/projects" className="cta-primary">
                  {lang === 'zh' ? '查看作品' : 'Projects'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/blog" className="cta-secondary">
                  {lang === 'zh' ? '阅读日志' : 'Journal'}
                </Link>
                <Link href={`mailto:${siteConfig.email}`} className="cta-secondary">
                  <Mail className="h-3.5 w-3.5" />
                  {lang === 'zh' ? '联系' : 'Contact'}
                </Link>
              </div>
            </div>

            {/* 自拍照 — 桌面端右对齐 */}
            <div className="hidden lg:block">
              <div className="portrait-frame" style={{ marginLeft: 'auto', width: '180px' }}>
                <Image
                  src="/images/portrait.jpg"
                  alt={lang === 'zh' ? '自拍照' : 'Self portrait'}
                  width={180}
                  height={240}
                  priority
                  sizes="180px"
                />
              </div>
              <p className="date-note mt-2.5" style={{ textAlign: 'right' }}>
                {new Date().toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* 移动端照片 — 底部居中 */}
          <div className="flex justify-center pt-2 lg:hidden">
            <div className="portrait-frame" style={{ width: '140px' }}>
              <Image
                src="/images/portrait.jpg"
                alt={lang === 'zh' ? 'Caged Sheep' : 'Caged Sheep'}
                width={140}
                height={187}
                priority
                sizes="140px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 精选作品 — 空状态改为自然文字 */}
      <section>
        <SectionHeading
          eyebrow={lang === 'zh' ? '精选作品' : 'Projects'}
          title={lang === 'zh' ? '最近在构建的几个方向。' : 'A few things I\'ve been building recently.'}
        />
        <p className="hand-note mt-5">
          {lang === 'zh' ? '还在整理中，稍后会在这里放一些真正想展示的东西。' : 'Still organizing. Will share things worth showing here soon.'}
        </p>
        <div className="mt-3">
          <Link href="/projects" className="cta-secondary text-sm">
            {lang === 'zh' ? '查看全部 →' : 'View all →'}
          </Link>
        </div>
      </section>

      {/* 聚焦方向 */}
      {skillGroups.length > 0 && (
        <section>
          <SectionHeading
            eyebrow={lang === 'zh' ? '我在聚焦什么' : 'Focus'}
            title={lang === 'zh' ? '构建、学习、反思。' : 'Building, learning, reflecting.'}
          />
          <div className="mt-6 space-y-5">
            {skillGroups.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-normal" style={{ color: 'var(--text-bright)', fontFamily: 'var(--font-title), serif' }}>
                  {lang === 'zh' ? group.title_zh : group.title_en}
                </h3>
                <p className="mt-1.5 text-[0.875rem] leading-[1.95]" style={{ color: 'var(--text-muted)' }}>
                  {group.items.map((item) => lang === 'zh' ? item.text_zh : item.text_en).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 最近日志 — 日期改手写体 */}
      <section>
        <SectionHeading
          eyebrow={lang === 'zh' ? '最近日志' : 'Journal'}
          title={lang === 'zh' ? '最近写下的内容。' : 'Recent writing from the log.'}
        />
        {recentPosts.length > 0 ? (
          <div className="mt-6 space-y-0">
            {recentPosts.map((post, idx) => {
              const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

              return (
                <div key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block py-5 hover-paper"
                    style={{ borderBottom: idx < recentPosts.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-normal transition-colors group-hover:text-[var(--accent)]" style={{ fontFamily: 'var(--font-title), serif' }}>
                          {post.title}
                        </h3>
                        {post.summary ? (
                          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-dim)' }}>
                            {post.summary}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                        <span className="date-note">
                          {formatDate(post.created_at, lang)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                          {getReadingTimeLabel(readingTime, lang)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="hand-note mt-5">
            {lang === 'zh' ? '还没有公开的文章，写好了会出现在这里。' : 'No public posts yet. They\'ll appear here when ready.'}
          </p>
        )}
        <div className="mt-3">
          <Link href="/blog" className="cta-secondary text-sm">
            <NotebookPen className="h-3.5 w-3.5" />
            {lang === 'zh' ? '浏览全部日志 →' : 'Browse all →'}
          </Link>
        </div>
      </section>
    </div>
  )
}

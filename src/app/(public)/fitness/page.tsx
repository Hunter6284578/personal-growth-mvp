import type { Metadata } from 'next'
import Link from 'next/link'
import { Dumbbell, BrainCircuit } from 'lucide-react'
import { fitnessCapabilities } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'
import { pickText } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLanguage()
  const isZh = lang === 'zh'

  return {
    title: 'Fitness',
    description: isZh
      ? '训练记录、趋势回看与 AI Fitness Advisor 模块说明。'
      : 'Training logs, trend reviews, and an overview of the AI Fitness Advisor module.',
    alternates: {
      canonical: '/fitness',
    },
  }
}

export const revalidate = 86400

export default async function FitnessPage() {
  const lang = await getCurrentLanguage()

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow="Fitness"
          title={lang === 'zh' ? '训练模块是长期主义的辅助线。' : 'The fitness module supports long-term growth.'}
          description={lang === 'zh' ? '用训练数据、恢复记录和 AI 建议体现自律、反馈意识与持续优化。' : 'Training data, recovery logs, and AI suggestions reinforce discipline, feedback loops, and continuous improvement.'}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {fitnessCapabilities.map((item) => (
            <div key={pickText(item.title, lang)} className="content-card hover-paper">
              <p className="text-base font-semibold" style={{ color: 'var(--text-bright)' }}>{pickText(item.title, lang)}</p>
              <p className="mt-2 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>{pickText(item.description, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/fit"
            className="cta-primary"
          >
            <Dumbbell className="h-4 w-4" />
            {lang === 'zh' ? '进入训练工作台' : 'Open training workspace'}
          </Link>
          <Link
            href="/fit/plan"
            className="cta-secondary"
          >
            <BrainCircuit className="h-4 w-4" />
            {lang === 'zh' ? 'AI Fitness Advisor' : 'Try AI Fitness Advisor'}
          </Link>
        </div>
      </section>
    </div>
  )
}

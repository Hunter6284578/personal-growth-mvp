import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, BrainCircuit, CalendarRange, Dumbbell, Scale, ShieldAlert } from 'lucide-react'
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

  const dashboards = lang === 'zh'
    ? [
        {
          title: '训练频率',
          value: '按周观察',
          description: '查看最近 7 天 / 30 天训练次数和连续记录情况。',
          icon: CalendarRange,
        },
        {
          title: '体重趋势',
          value: '按日期追踪',
          description: '结合每日健康记录看体重变化和恢复状态。',
          icon: Scale,
        },
        {
          title: '动作进展',
          value: '按动作回看',
          description: '重点动作关注总组数、负重和容量变化。',
          icon: Activity,
        },
      ]
    : [
        {
          title: 'Training Frequency',
          value: 'Weekly View',
          description: 'Track workout counts and streaks across the last 7 or 30 days.',
          icon: CalendarRange,
        },
        {
          title: 'Weight Trend',
          value: 'Date-based',
          description: 'Review body weight changes and recovery state alongside daily records.',
          icon: Scale,
        },
        {
          title: 'Exercise Progress',
          value: 'By Movement',
          description: 'Focus on total sets, load, and training volume for key lifts.',
          icon: Activity,
        },
      ]

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow="Fitness"
          title={lang === 'zh' ? '训练模块是长期主义的辅助线，而不是把站点做成健身 App。' : 'The fitness module supports long-term growth instead of turning the site into a fitness app.'}
          description={lang === 'zh' ? '它更像个人系统的一部分：用训练数据、恢复记录和 AI 建议体现自律、反馈意识与持续优化。' : 'It acts more like a personal system: training data, recovery logs, and AI suggestions all reinforce discipline, feedback loops, and continuous improvement.'}
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h3 className="text-lg font-semibold text-white">{lang === 'zh' ? '为什么保留这个模块' : 'Why keep this module'}</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>{lang === 'zh' ? '• 它能证明我会长期记录，而不是只在需要时临时包装自己。' : '• It shows I can document consistently instead of presenting a polished image only when needed.'}</p>
              <p>{lang === 'zh' ? '• 它让“数据驱动”不是口号，而是在生活系统里实际落地。' : '• It turns “data-driven” from a slogan into something real inside daily life.'}</p>
              <p>{lang === 'zh' ? '• 它也是一个很适合接入 AI API 的真实使用场景。' : '• It also provides a realistic scenario for integrating AI APIs.'}</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h3 className="text-lg font-semibold text-white">{lang === 'zh' ? '当前目标' : 'Current goals'}</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>{lang === 'zh' ? '• 先把“能记录、能查看、能总结、能调用 AI”做扎实。' : '• Make logging, reviewing, summarizing, and AI usage solid first.'}</p>
              <p>{lang === 'zh' ? '• 逐步补齐体重趋势、恢复状态和目标管理。' : '• Gradually improve trend tracking, recovery state, and goal management.'}</p>
              <p>{lang === 'zh' ? '• 所有 AI 建议都明确标注仅供参考，不伪装成专业医疗系统。' : '• Every AI suggestion is clearly framed as reference, not as medical authority.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fitnessCapabilities.map((item) => (
          <div key={pickText(item.title, lang)} className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <p className="text-lg font-semibold text-white">{pickText(item.title, lang)}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{pickText(item.description, lang)}</p>
          </div>
        ))}
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow={lang === 'zh' ? '观察维度' : 'Observability'}
          title={lang === 'zh' ? 'Fitness 页面聚焦三个最有价值的观察维度。' : 'The fitness page focuses on three observation layers that matter most.'}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {dashboards.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-5 w-5 text-emerald-300" />
                  <span className="metric-font text-xs uppercase tracking-[0.24em] text-slate-500">
                    {item.value}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow="AI Advisor"
          title={lang === 'zh' ? 'AI 只做辅助总结和建议，不做权威诊断。' : 'AI only assists with summaries and suggestions, never authority.'}
          description={lang === 'zh' ? '建议输入会读取近期训练、体重和备注，并结合目标给出频率、负重、恢复与动作安排建议。' : 'The assistant reads recent training, weight, and notes, then suggests frequency, load, recovery, and exercise arrangement based on your goals.'}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-5 w-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-white">{lang === 'zh' ? '输入来源' : 'Inputs'}</h3>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
              <p>{lang === 'zh' ? '• 最近训练记录' : '• Recent workout logs'}</p>
              <p>{lang === 'zh' ? '• 体重与每日健康数据' : '• Weight and daily health data'}</p>
              <p>{lang === 'zh' ? '• 某些动作的近期进展' : '• Recent progress on selected lifts'}</p>
              <p>{lang === 'zh' ? '• 主观备注与训练目标' : '• Subjective notes and training goals'}</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-300" />
              <h3 className="text-lg font-semibold text-white">{lang === 'zh' ? '输出原则' : 'Output Principles'}</h3>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
              <p>{lang === 'zh' ? '• 本周训练总结' : '• Weekly training summary'}</p>
              <p>{lang === 'zh' ? '• 恢复与训练频率提醒' : '• Recovery and frequency reminders'}</p>
              <p>{lang === 'zh' ? '• 负重与动作安排建议' : '• Load and exercise planning suggestions'}</p>
              <p>{lang === 'zh' ? '• 仅供参考，不替代教练或医疗建议' : '• Guidance only, not a substitute for coaching or medical advice'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/fit"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Dumbbell className="h-4 w-4" />
            {lang === 'zh' ? '进入训练记录工作台' : 'Open training workspace'}
          </Link>
          <Link
            href="/fit/plan"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-100"
          >
            <BrainCircuit className="h-4 w-4" />
            {lang === 'zh' ? '试用 AI Fitness Advisor' : 'Try AI Fitness Advisor'}
          </Link>
        </div>
      </section>
    </div>
  )
}

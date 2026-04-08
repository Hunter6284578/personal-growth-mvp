import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, BrainCircuit, CalendarRange, Dumbbell, Scale, ShieldAlert } from 'lucide-react'
import { fitnessCapabilities } from '@/content/site'
import { SectionHeading } from '@/components/site/SectionHeading'

export const metadata: Metadata = {
  title: 'Fitness',
  description: '训练记录、趋势回看与 AI Fitness Advisor 模块说明。',
}

const dashboards = [
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

export default function FitnessPage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="public-section space-y-8">
        <SectionHeading
          eyebrow="Fitness"
          title="健身模块是长期主义的辅助线，不是把站点做成健身 App。"
          description="它更像个人系统的一部分：用训练数据、恢复记录和 AI 建议体现自律、反馈意识和持续优化习惯。"
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-stone-950">为什么保留这个模块</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
              <p>• 它能证明我会长期记录，而不是只在需要时临时包装自己。</p>
              <p>• 它让“数据驱动”不是口号，而是能在生活系统里实际落地。</p>
              <p>• 它也正好是一个适合接入 AI API 的真实使用场景。</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-stone-950">当前目标</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
              <p>• 先把“能记录、能查看、能总结、能调用 AI”做扎实。</p>
              <p>• 逐步补齐体重趋势、恢复状态和目标管理。</p>
              <p>• 所有 AI 建议都明确标注仅供参考，不伪装成专业医疗系统。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fitnessCapabilities.map((item) => (
          <div key={item.title} className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <p className="text-lg font-semibold text-stone-950">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow="Dashboard Scope"
          title="Fitness 页面会聚焦三个最有价值的观察维度。"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {dashboards.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-[2rem] border border-stone-200 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-5 w-5 text-teal-700" />
                  <span className="metric-font text-xs uppercase tracking-[0.24em] text-stone-500">
                    {item.value}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="public-section space-y-6">
        <SectionHeading
          eyebrow="AI Advisor"
          title="AI 只做辅助总结和建议，不做权威诊断。"
          description="建议输入会读取近期训练、体重和备注，并结合你的目标给出频率、负重、恢复与动作安排建议。"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-5 w-5 text-teal-700" />
              <h3 className="text-lg font-semibold text-stone-950">输入来源</h3>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-7 text-stone-600">
              <p>• 最近训练记录</p>
              <p>• 体重与每日健康数据</p>
              <p>• 某些动作的近期进展</p>
              <p>• 主观备注与训练目标</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-stone-950">输出原则</h3>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-7 text-stone-600">
              <p>• 本周训练总结</p>
              <p>• 恢复与训练频率提醒</p>
              <p>• 负重与动作安排建议</p>
              <p>• 仅供参考，不替代教练或医疗建议</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/fit"
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
          >
            <Dumbbell className="h-4 w-4" />
            进入训练记录工作台
          </Link>
          <Link
            href="/fit/plan"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
          >
            <BrainCircuit className="h-4 w-4" />
            试用 AI Fitness Advisor
          </Link>
        </div>
      </section>
    </div>
  )
}

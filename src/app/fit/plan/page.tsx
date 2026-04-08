'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BrainCircuit, Loader2, ShieldAlert, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength'

const goalOptions: Array<{ value: FitnessGoal; label: string; description: string }> = [
  { value: 'muscle_gain', label: '增肌', description: '优先考虑训练容量、恢复和渐进超负荷。' },
  { value: 'fat_loss', label: '减脂', description: '兼顾力量保留、训练频率和恢复压力。' },
  { value: 'maintenance', label: '维持', description: '优先稳定训练节奏，避免无效疲劳。' },
  { value: 'strength', label: '提高力量', description: '更关注动作表现、组次安排和负重建议。' },
]

export default function FitAdvisorPage() {
  const [goal, setGoal] = useState<FitnessGoal>('muscle_gain')
  const [note, setNote] = useState('')
  const [advice, setAdvice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generateAdvice = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/fit/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal, note }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '生成建议失败')
        return
      }

      setAdvice(data.advice || '')
    } catch {
      setError('网络请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Fitness Advisor</h1>
          <p className="mt-1 text-sm text-slate-400">
            基于最近训练、体重和备注生成训练建议，定位是辅助复盘，不替代教练或医疗意见。
          </p>
        </div>
        <Button onClick={generateAdvice} loading={loading} disabled={loading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? '分析中...' : '生成建议'}
        </Button>
      </div>

      <Card>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-200">当前目标</p>
              <div className="mt-3 grid gap-3">
                {goalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGoal(option.value)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      goal === option.value
                        ? 'border-teal-400 bg-teal-500/10'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">{option.label}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-400">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200">补充说明</p>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={6}
                placeholder="例如：最近睡眠一般、肩推卡住了、下周训练时间变少等。"
                className="mt-3"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
            {error ? (
              <div className="rounded-2xl border border-red-800 bg-red-900/20 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-slate-400">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-teal-400" />
                AI 正在整理你最近的训练摘要和建议。
              </div>
            ) : advice ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl border border-amber-700/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  <ShieldAlert className="h-4 w-4 text-amber-300" />
                  仅供参考，不替代专业教练或医疗建议。
                </div>
                <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{advice}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center text-slate-400">
                <BrainCircuit className="mb-4 h-12 w-12 text-slate-600" />
                <p className="text-sm">点击“生成建议”后，系统会读取最近训练与健康记录给出摘要。</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

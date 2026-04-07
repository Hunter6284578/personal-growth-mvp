'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, Loader2, CheckCircle, Dumbbell } from 'lucide-react'
import type { AIPlan } from '@/types/fit'

export default function FitPlanPage() {
  const [plan, setPlan] = useState<AIPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generatePlan = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/fit/plan', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '生成计划失败')
        return
      }

      setPlan(data.plan)
    } catch (err) {
      setError('网络请求失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI 训练计划</h1>
          <p className="text-gray-400 text-sm mt-1">基于近期数据智能生成今日训练计划</p>
        </div>
        <Button onClick={generatePlan} loading={loading} disabled={loading}>
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? '生成中...' : '生成计划'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">AI 正在分析你的训练数据...</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{plan.focus_area}</h2>
                <p className="text-sm text-gray-400">{plan.plan_date}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </Card>

          {plan.exercises.map((exercise, index) => (
            <Card key={index}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium flex items-center">
                    <Dumbbell className="w-4 h-4 mr-2 text-blue-400" />
                    {exercise.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                      {exercise.target_sets} 组
                    </span>
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                      {exercise.rep_range} 次
                    </span>
                    <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded">
                      {exercise.intensity_guideline}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 italic">
                    {exercise.rationale}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!plan && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <Sparkles className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-500">点击"生成计划"获取今日 AI 训练推荐</p>
          <p className="text-gray-600 text-sm mt-2">
            AI 会分析你过去 14 天的肩部训练数据
          </p>
        </div>
      )}
    </div>
  )
}

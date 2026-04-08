'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getFitLogDates, getShoulderVolumeTrend } from '@/lib/fit/services'
import { useAuth } from '@/hooks/useAuth'
import {
  BarChart3, Dumbbell, ClipboardList, Sparkles,
  TrendingUp, Calendar, Flame
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

export default function FitDashboardPage() {
  const { user } = useAuth()
  const [logDates, setLogDates] = useState<string[]>([])
  const [volumeTrend, setVolumeTrend] = useState<{ date: string; volume: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [weekCount, setWeekCount] = useState(0)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [dates, trend] = await Promise.all([
        getFitLogDates(user.id),
        getShoulderVolumeTrend(user.id),
      ])
      setLogDates(dates)
      setVolumeTrend(trend)

      // 计算连续打卡天数
      const streakDays = calcStreak(dates)
      setStreak(streakDays)

      // 计算本周训练天数
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]
      setWeekCount(dates.filter(d => d >= weekStartStr).length)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      void loadData()
    }
  }, [user, loadData])

  const calcStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0
    const sorted = [...dates].sort().reverse()
    const today = new Date().toISOString().split('T')[0]

    let streak = 0
    const checkDate = new Date(today)

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (sorted.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // 今天没练，从昨天开始算
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      } else {
        break
      }
    }
    return streak
  }

  // 生成最近 28 天的热力图数据
  const heatmapData = Array.from({ length: 28 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 27 + i)
    const dateStr = date.toISOString().split('T')[0]
    return { date: dateStr, trained: logDates.includes(dateStr) }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">训练总览</h1>
          <p className="text-gray-400 text-sm mt-1">关注频率、容量和最近训练状态</p>
        </div>
        <Link href="/fit/logs">
          <Button variant="primary">
            <ClipboardList className="w-4 h-4 mr-2" />
            记录训练
          </Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-900/50 rounded-lg">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">连续打卡</p>
              <p className="text-2xl font-bold text-white">{streak} 天</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">本周训练</p>
              <p className="text-2xl font-bold text-white">{weekCount} 天</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">总训练</p>
              <p className="text-2xl font-bold text-white">{logDates.length} 天</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">14天容量</p>
              <p className="text-2xl font-bold text-white">
                {volumeTrend.reduce((sum, d) => sum + d.volume, 0)} kg
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/fit/logs">
          <Card className="hover:border-blue-600 transition-colors cursor-pointer">
            <div className="text-center py-4">
              <ClipboardList className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">记录训练</p>
            </div>
          </Card>
        </Link>
        <Link href="/fit/plan">
          <Card className="hover:border-purple-600 transition-colors cursor-pointer">
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">AI 建议</p>
            </div>
          </Card>
        </Link>
        <Link href="/fit/exercises">
          <Card className="hover:border-green-600 transition-colors cursor-pointer">
            <div className="text-center py-4">
              <Dumbbell className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">动作库</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* 打卡热力图 */}
      <Card title="训练打卡" subtitle="最近 28 天">
        <div className="grid grid-cols-7 gap-1.5">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => (
            <div key={d} className="text-center text-xs text-gray-500 pb-1">{d}</div>
          ))}
          {/* 填充空白对齐 */}
          {Array.from({ length: (heatmapData[0]?.date ? new Date(heatmapData[0].date).getDay() : 0) - 1 }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {heatmapData.map(day => (
            <div
              key={day.date}
              className={`aspect-square rounded-sm ${
                day.trained ? 'bg-green-500' : 'bg-gray-800'
              }`}
              title={`${day.date}${day.trained ? ' ✓' : ''}`}
            />
          ))}
        </div>
      </Card>

      {/* 肩部容量趋势 */}
      <Card title="重点动作容量趋势" subtitle="当前默认展示肩部相关容量（过去 14 天）">
        {volumeTrend.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeTrend}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                  label={{ value: 'kg', position: 'insideTopLeft', fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
            暂无可用于趋势分析的训练数据
          </div>
        )}
      </Card>
    </div>
  )
}

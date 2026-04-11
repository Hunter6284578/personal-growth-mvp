'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { 
  getLatestStatScore, 
  getStatScores, 
  createStatScore 
} from '@/lib/services'
import { STAT_CONFIG } from '@/lib/constants'
import { StatScore } from '@/types'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import { TrendingUp, Target, Calendar, Sparkles } from 'lucide-react'

export default function StatsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    physical_score: 50,
    execution_score: 50,
    focus_score: 50,
    emotion_score: 50,
    social_score: 50,
    creativity_score: 50,
  })
  const [note, setNote] = useState('')
  const [history, setHistory] = useState<StatScore[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [trendDays, setTrendDays] = useState<7 | 30>(7)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const loadData = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const latest = await getLatestStatScore(user.id)
      if (latest) {
        setStats({
          physical_score: latest.physical_score,
          execution_score: latest.execution_score,
          focus_score: latest.focus_score,
          emotion_score: latest.emotion_score,
          social_score: latest.social_score,
          creativity_score: latest.creativity_score,
        })
        if (latest.note) setNote(latest.note)
      }
      
      const historyData = await getStatScores(user.id, 30)
      setHistory(historyData)
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

  const handleAIEval = async () => {
    if (!user) {
      toast('请先登录', 'error')
      return
    }
    
    setEvaluating(true)
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'attribute_eval' })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'AI 评估失败')
      }
      
      const result = data.result
      setStats({
        physical_score: result.physical_score,
        execution_score: result.execution_score,
        focus_score: result.focus_score,
        emotion_score: result.emotion_score,
        social_score: result.social_score,
        creativity_score: result.creativity_score,
      })
      
      if (result.note) {
        setNote(result.note)
      }
      
      toast('AI 评估完成！已自动填入建议数值，请确认后点击保存。', 'success')
    } catch (error) {
      console.error('AI 评估失败:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast('网络连接失败，请检查网络后重试', 'error')
      } else {
        toast(error instanceof Error ? error.message : 'AI 评估失败，请稍后重试', 'error')
      }
    } finally {
      setEvaluating(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast('请先登录', 'error')
      return
    }
    
    setSaving(true)
    try {
      await createStatScore({
        user_id: user.id,
        ...stats,
        note: note || undefined,
      })
      
      toast('保存成功！', 'success')
      const historyData = await getStatScores(user.id, 30)
      setHistory(historyData)
    } catch (error) {
      console.error('保存失败:', error)
      toast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  const statsSummary = useMemo(() => {
    if (history.length === 0) return null
    
    const latest = history[0]
    const avg = {
      physical: Math.round(history.reduce((a, b) => a + b.physical_score, 0) / history.length),
      execution: Math.round(history.reduce((a, b) => a + b.execution_score, 0) / history.length),
      focus: Math.round(history.reduce((a, b) => a + b.focus_score, 0) / history.length),
      emotion: Math.round(history.reduce((a, b) => a + b.emotion_score, 0) / history.length),
      social: Math.round(history.reduce((a, b) => a + b.social_score, 0) / history.length),
      creativity: Math.round(history.reduce((a, b) => a + b.creativity_score, 0) / history.length),
    }
    
    const currentAvg = Math.round((latest.physical_score + latest.execution_score + latest.focus_score + 
                                   latest.emotion_score + latest.social_score + latest.creativity_score) / 6)
    const totalAvg = Math.round((avg.physical + avg.execution + avg.focus + avg.emotion + avg.social + avg.creativity) / 6)
    
    return { latest, avg, currentAvg, totalAvg }
  }, [history])

  const radarData = useMemo(() => {
    if (history.length === 0) return []
    
    const latest = history[0]
    const avg = {
      physical_score: Math.round(history.reduce((a, b) => a + b.physical_score, 0) / history.length),
      execution_score: Math.round(history.reduce((a, b) => a + b.execution_score, 0) / history.length),
      focus_score: Math.round(history.reduce((a, b) => a + b.focus_score, 0) / history.length),
      emotion_score: Math.round(history.reduce((a, b) => a + b.emotion_score, 0) / history.length),
      social_score: Math.round(history.reduce((a, b) => a + b.social_score, 0) / history.length),
      creativity_score: Math.round(history.reduce((a, b) => a + b.creativity_score, 0) / history.length),
    }
    
    return STAT_CONFIG.map(stat => ({
      subject: stat.shortLabel,
      当前: latest[stat.key as keyof StatScore] as number,
      平均: avg[stat.key as keyof typeof avg],
      fullMark: 100,
    }))
  }, [history])

  const trendData = useMemo(() => {
    const days = trendDays
    return history.slice(0, days).reverse().map(item => ({
      date: new Date(item.score_date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      身体素质: item.physical_score,
      执行力: item.execution_score,
      专注力: item.focus_score,
      情绪稳定性: item.emotion_score,
      社交状态: item.social_score,
      创造力: item.creativity_score,
      平均: Math.round((item.physical_score + item.execution_score + item.focus_score + 
                       item.emotion_score + item.social_score + item.creativity_score) / 6)
    }))
  }, [history, trendDays])

  const strongestStat = useMemo(() => {
    if (history.length === 0) return null
    const latest = history[0]
    const values = STAT_CONFIG.map(stat => ({
      key: stat.key,
      label: stat.label,
      value: latest[stat.key as keyof StatScore] as number,
      color: stat.color,
    }))
    return values.sort((a, b) => b.value - a.value)[0]
  }, [history])

  const weakestStat = useMemo(() => {
    if (history.length === 0) return null
    const latest = history[0]
    const values = STAT_CONFIG.map(stat => ({
      key: stat.key,
      label: stat.label,
      value: latest[stat.key as keyof StatScore] as number,
      color: stat.color,
    }))
    return values.sort((a, b) => a.value - b.value)[0]
  }, [history])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: 'var(--text-muted)' }}>加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-bright)' }}>属性面板</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>评估和追踪你的六大核心能力</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleAIEval} 
            disabled={evaluating || saving}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {evaluating ? 'AI 评估中...' : 'AI 评估'}
          </Button>
          <Button onClick={handleSave} disabled={saving || evaluating}>
            {saving ? '保存中...' : '保存记录'}
          </Button>
        </div>
      </div>

      {statsSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--dash-info)' }}>{statsSummary.currentAvg}</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>当前综合</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--dash-success)' }}>{statsSummary.totalAvg}</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>历史平均</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: strongestStat?.color }}>
              {strongestStat?.value}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>最强: {strongestStat?.label}</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: weakestStat?.color }}>
              {weakestStat?.value}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>待提升: {weakestStat?.label}</p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="属性调整" subtitle="拖动滑块设置当前数值">
          <div className="space-y-5">
            {STAT_CONFIG.map((stat) => (
              <div key={stat.key}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>{stat.label}</span>
                  <span className="font-bold" style={{ color: stat.color }}>
                    {stats[stat.key as keyof typeof stats]}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stats[stat.key as keyof typeof stats]}
                  onChange={(e) =>
                    setStats((prev) => ({
                      ...prev,
                      [stat.key]: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${stat.color} 0%, ${stat.color} ${stats[stat.key as keyof typeof stats]}%, var(--dash-border) ${stats[stat.key as keyof typeof stats]}%, var(--dash-border) 100%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="能力分布" subtitle="当前 vs 历史平均">
          <div className="h-[320px] w-full">
            {radarData.length > 0 && mountedRef.current ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--dash-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="当前"
                    dataKey="当前"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="var(--accent)"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="平均"
                    dataKey="平均"
                    stroke="var(--dash-success)"
                    strokeWidth={2}
                    fill="var(--dash-success)"
                    fillOpacity={0.08}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--dash-surface)', 
                      border: '1px solid var(--dash-border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                <Target className="w-14 h-14 mb-4" style={{ color: 'var(--text-dim)' }} />
                <p>暂无数据</p>
                <p className="text-sm">保存第一条记录后将显示雷达图</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="备注" subtitle="记录本次评分的背景和思考">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="为什么给出这些分数？有什么特别的考虑？"
          rows={3}
          className="pg-input resize-none"
        />
      </Card>

      <Card 
        title="历史趋势" 
        subtitle={
          <div className="flex items-center gap-2">
            <span>评分变化</span>
            <div className="flex rounded-lg p-1" style={{ background: 'var(--dash-card-soft)' }}>
              <button
                onClick={() => setTrendDays(7)}
                className="px-3 py-1 text-xs rounded transition-colors"
                style={{
                  background: trendDays === 7 ? 'var(--accent)' : 'transparent',
                  color: trendDays === 7 ? 'var(--bg)' : 'var(--text-muted)',
                }}
              >
                7天
              </button>
              <button
                onClick={() => setTrendDays(30)}
                className="px-3 py-1 text-xs rounded transition-colors"
                style={{
                  background: trendDays === 30 ? 'var(--accent)' : 'transparent',
                  color: trendDays === 30 ? 'var(--bg)' : 'var(--text-muted)',
                }}
              >
                30天
              </button>
            </div>
          </div>
        }
      >
        {trendData.length > 1 && mountedRef.current ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--dash-surface)', 
                    border: '1px solid var(--dash-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12 }} />
                {STAT_CONFIG.map((stat) => (
                  <Line
                    key={stat.key}
                    type="monotone"
                    dataKey={stat.label}
                    stroke={stat.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: stat.color }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="平均"
                  stroke="var(--text-dim)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <TrendingUp className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
            <p>数据不足，无法显示趋势图</p>
            <p className="text-sm mt-2">至少需要2条记录才能生成图表</p>
          </div>
        )}
      </Card>

      {history.length > 0 && (
        <Card title="历史记录" subtitle={`共 ${history.length} 条记录`}>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {history.map((record, index) => {
              const avg = Math.round((record.physical_score + record.execution_score + record.focus_score + 
                                     record.emotion_score + record.social_score + record.creativity_score) / 6)
              const prevAvg = index < history.length - 1 
                ? Math.round((history[index + 1].physical_score + history[index + 1].execution_score + 
                             history[index + 1].focus_score + history[index + 1].emotion_score + 
                             history[index + 1].social_score + history[index + 1].creativity_score) / 6)
                : avg
              const change = avg - prevAvg
              
              return (
                <div key={record.id} className="pg-card-soft p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
                      <span className="font-medium" style={{ color: 'var(--text-bright)' }}>
                        {new Date(record.score_date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>平均分: {avg}</span>
                      {change !== 0 && index < history.length - 1 && (
                        <span className="text-xs" style={{ color: change > 0 ? 'var(--dash-success)' : 'var(--dash-danger)' }}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-sm">
                    {STAT_CONFIG.map((stat) => (
                      <div key={stat.key} className="text-center">
                        <span className="block text-xs" style={{ color: 'var(--text-dim)' }}>{stat.shortLabel}</span>
                        <span style={{ color: stat.color }}>
                          {record[stat.key as keyof StatScore]}
                        </span>
                      </div>
                    ))}
                  </div>
                  {record.note && (
                    <p className="text-sm mt-2 pt-2" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--dash-border)' }}>
                      {record.note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

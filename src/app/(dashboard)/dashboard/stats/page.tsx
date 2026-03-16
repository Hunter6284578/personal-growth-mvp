'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { 
  getLatestStatScore, 
  getStatScores, 
  createStatScore 
} from '@/lib/services'
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
import { TrendingUp, Target, Calendar } from 'lucide-react'

const statLabels = [
  { key: 'physical_score', label: '身体素质', color: '#EF4444', shortLabel: '体质' },
  { key: 'execution_score', label: '执行力', color: '#3B82F6', shortLabel: '执行' },
  { key: 'focus_score', label: '专注力', color: '#10B981', shortLabel: '专注' },
  { key: 'emotion_score', label: '情绪稳定性', color: '#F59E0B', shortLabel: '情绪' },
  { key: 'social_score', label: '社交状态', color: '#8B5CF6', shortLabel: '社交' },
  { key: 'creativity_score', label: '创造力', color: '#EC4899', shortLabel: '创造' },
]

export default function StatsPage() {
  const { user } = useAuth()
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
  const [trendDays, setTrendDays] = useState<7 | 30>(7)

  // 加载最新数据和历史记录
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // 获取最新评分
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
      
      // 获取历史记录（最多30条）
      const historyData = await getStatScores(user.id, 30)
      setHistory(historyData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      alert('请先登录')
      return
    }
    
    setSaving(true)
    try {
      const { error } = await createStatScore({
        user_id: user.id,
        ...stats,
        note: note || undefined,
      })
      
      if (error) throw error
      
      alert('保存成功！')
      // 重新加载历史记录
      const historyData = await getStatScores(user.id, 30)
      setHistory(historyData)
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 计算统计数据
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

  // 雷达图数据
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
    
    return statLabels.map(stat => ({
      subject: stat.shortLabel,
      当前: latest[stat.key as keyof StatScore] as number,
      平均: avg[stat.key as keyof typeof avg],
      fullMark: 100,
    }))
  }, [history])

  // 趋势图数据
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

  // 找出最强和最弱属性
  const strongestStat = useMemo(() => {
    if (history.length === 0) return null
    const latest = history[0]
    const values = [
      { key: 'physical_score', label: '身体素质', value: latest.physical_score, color: '#EF4444' },
      { key: 'execution_score', label: '执行力', value: latest.execution_score, color: '#3B82F6' },
      { key: 'focus_score', label: '专注力', value: latest.focus_score, color: '#10B981' },
      { key: 'emotion_score', label: '情绪稳定性', value: latest.emotion_score, color: '#F59E0B' },
      { key: 'social_score', label: '社交状态', value: latest.social_score, color: '#8B5CF6' },
      { key: 'creativity_score', label: '创造力', value: latest.creativity_score, color: '#EC4899' },
    ]
    return values.sort((a, b) => b.value - a.value)[0]
  }, [history])

  const weakestStat = useMemo(() => {
    if (history.length === 0) return null
    const latest = history[0]
    const values = [
      { key: 'physical_score', label: '身体素质', value: latest.physical_score, color: '#EF4444' },
      { key: 'execution_score', label: '执行力', value: latest.execution_score, color: '#3B82F6' },
      { key: 'focus_score', label: '专注力', value: latest.focus_score, color: '#10B981' },
      { key: 'emotion_score', label: '情绪稳定性', value: latest.emotion_score, color: '#F59E0B' },
      { key: 'social_score', label: '社交状态', value: latest.social_score, color: '#8B5CF6' },
      { key: 'creativity_score', label: '创造力', value: latest.creativity_score, color: '#EC4899' },
    ]
    return values.sort((a, b) => a.value - b.value)[0]
  }, [history])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">属性面板</h1>
          <p className="text-gray-400 mt-1">评估和追踪你的六大核心能力</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存记录'}
        </Button>
      </div>

      {/* 统计概览卡片 */}
      {statsSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-400">{statsSummary.currentAvg}</div>
            <p className="text-gray-400 text-sm">当前综合</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-400">{statsSummary.totalAvg}</div>
            <p className="text-gray-400 text-sm">历史平均</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: strongestStat?.color }}>
              {strongestStat?.value}
            </div>
            <p className="text-gray-400 text-sm">最强: {strongestStat?.label}</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: weakestStat?.color }}>
              {weakestStat?.value}
            </div>
            <p className="text-gray-400 text-sm">待提升: {weakestStat?.label}</p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 属性调整 */}
        <Card title="属性调整" subtitle="拖动滑块设置当前数值">
          <div className="space-y-5">
            {statLabels.map((stat) => (
              <div key={stat.key}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">{stat.label}</span>
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
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${stat.color} 0%, ${stat.color} ${stats[stat.key as keyof typeof stats]}%, #374151 ${stats[stat.key as keyof typeof stats]}%, #374151 100%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 六维雷达图 */}
        <Card title="能力分布" subtitle="当前 vs 历史平均">
          <div className="h-[320px] w-full">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="当前"
                    dataKey="当前"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="平均"
                    dataKey="平均"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="#10B981"
                    fillOpacity={0.1}
                  />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Target className="w-16 h-16 mb-4 text-gray-700" />
                <p>暂无数据</p>
                <p className="text-sm">保存第一条记录后将显示雷达图</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 备注 */}
      <Card title="备注" subtitle="记录本次评分的背景和思考">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="为什么给出这些分数？有什么特别的考虑？"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </Card>

      {/* 历史趋势图表 */}
      <Card 
        title="历史趋势" 
        subtitle={
          <div className="flex items-center gap-2">
            <span>评分变化</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTrendDays(7)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  trendDays === 7 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                7天
              </button>
              <button
                onClick={() => setTrendDays(30)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  trendDays === 30 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                30天
              </button>
            </div>
          </div>
        }
      >
        {trendData.length > 1 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {statLabels.map((stat) => (
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
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <p>数据不足，无法显示趋势图</p>
            <p className="text-sm mt-2">至少需要2条记录才能生成图表</p>
          </div>
        )}
      </Card>

      {/* 历史记录列表 */}
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
                <div key={record.id} className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-white font-medium">
                        {new Date(record.score_date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">平均分: {avg}</span>
                      {change !== 0 && index < history.length - 1 && (
                        <span className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-sm">
                    {statLabels.map((stat) => (
                      <div key={stat.key} className="text-center">
                        <span className="text-gray-500 block text-xs">{stat.shortLabel}</span>
                        <span style={{ color: stat.color }}>
                          {record[stat.key as keyof StatScore]}
                        </span>
                      </div>
                    ))}
                  </div>
                  {record.note && (
                    <p className="text-gray-400 text-sm mt-2 pt-2 border-t border-gray-800">
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

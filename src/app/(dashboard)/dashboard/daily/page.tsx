'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, Smile, Trash2, Edit2 } from 'lucide-react'
import { getDailyLogs, getDailyLogByDate, upsertDailyLog, deleteDailyLog } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { DailyLog } from '@/types'

export default function DailyLogPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 表单状态
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState('')
  const [goodPoints, setGoodPoints] = useState('')
  const [badPoints, setBadPoints] = useState('')
  const [reflection, setReflection] = useState('')
  const [tomorrowPlan, setTomorrowPlan] = useState('')
  const [moodScore, setMoodScore] = useState(7)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    if (!user) return
    try {
      const data = await getDailyLogs(user.id, 30)
      setLogs(data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const loadLogForDate = useCallback(async (date: string) => {
    if (!user) return
    try {
      const log = await getDailyLogByDate(user.id, date)
      if (log) {
        setEditingId(log.id)
        setSummary(log.summary || '')
        setGoodPoints(log.good_points || '')
        setBadPoints(log.bad_points || '')
        setReflection(log.reflection || '')
        setTomorrowPlan(log.tomorrow_plan || '')
        setMoodScore(log.mood_score || 7)
      } else {
        resetForm()
      }
    } catch (error) {
      console.error('Error loading log:', error)
    }
  }, [user])

  // 加载数据
  useEffect(() => {
    if (user) {
      void loadLogs()
    }
  }, [user, loadLogs])

  // 当日期改变时，加载该日期的记录
  useEffect(() => {
    if (user) {
      void loadLogForDate(selectedDate)
    }
  }, [selectedDate, user, loadLogForDate])

  const resetForm = () => {
    setEditingId(null)
    setSummary('')
    setGoodPoints('')
    setBadPoints('')
    setReflection('')
    setTomorrowPlan('')
    setMoodScore(7)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await upsertDailyLog({
        id: editingId || undefined,
        user_id: user.id,
        log_date: selectedDate,
        summary,
        good_points: goodPoints,
        bad_points: badPoints,
        reflection,
        tomorrow_plan: tomorrowPlan,
        mood_score: moodScore,
      })
      await loadLogs()
      alert(editingId ? '更新成功！' : '保存成功！')
    } catch (error) {
      console.error('Error saving log:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    
    try {
      await deleteDailyLog(id)
      await loadLogs()
      if (editingId === id) {
        resetForm()
      }
    } catch (error) {
      console.error('Error deleting log:', error)
      alert('删除失败')
    }
  }

  const handleEdit = (log: DailyLog) => {
    setSelectedDate(log.log_date)
    setEditingId(log.id)
    setSummary(log.summary || '')
    setGoodPoints(log.good_points || '')
    setBadPoints(log.bad_points || '')
    setReflection(log.reflection || '')
    setTomorrowPlan(log.tomorrow_plan || '')
    setMoodScore(log.mood_score || 7)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const moodEmojis = ['😢', '😟', '😐', '🙂', '😊', '😃', '😄', '🤩', '🌟', '✨']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">每日记录</h1>
        <p className="text-gray-400 mt-1">记录每一天的成长与反思</p>
      </div>

      {/* 表单 */}
      <Card title={editingId ? '编辑记录' : '添加记录'} subtitle={selectedDate}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                日期
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Smile className="w-4 h-4 inline mr-1" />
                心情指数: {moodScore}/10 {moodEmojis[moodScore - 1]}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodScore}
                onChange={(e) => setMoodScore(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${moodScore * 10}%, #374151 ${moodScore * 10}%, #374151 100%)`,
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">今日总结</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简单总结今天的主要活动和收获..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">做得好的地方</label>
              <textarea
                value={goodPoints}
                onChange={(e) => setGoodPoints(e.target.value)}
                placeholder="今天有哪些做得好的地方？"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">需要改进的地方</label>
              <textarea
                value={badPoints}
                onChange={(e) => setBadPoints(e.target.value)}
                placeholder="今天有哪些可以改进的地方？"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">深度反思</label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="今天学到了什么？有什么感悟？"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">明日计划</label>
            <textarea
              value={tomorrowPlan}
              onChange={(e) => setTomorrowPlan(e.target.value)}
              placeholder="明天最重要的三件事是什么？"
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              {editingId ? '更新记录' : '保存记录'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                取消编辑
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* 历史记录列表 */}
      <Card title="历史记录" subtitle={`共 ${logs.length} 条记录`}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无记录</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border transition-colors ${
                  editingId === log.id
                    ? 'bg-blue-600/10 border-blue-500'
                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{log.log_date}</span>
                    <span className="text-yellow-400">
                      {moodEmojis[(log.mood_score || 5) - 1]} {log.mood_score}/10
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {log.summary && (
                  <p className="text-gray-400 text-sm line-clamp-2">{log.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Star, Trash2, Edit2, X } from 'lucide-react'
import { getLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { LifeEvent } from '@/types'

const statOptions = [
  { value: 'physical_score', label: '身体素质' },
  { value: 'execution_score', label: '执行力' },
  { value: 'focus_score', label: '专注力' },
  { value: 'emotion_score', label: '情绪稳定性' },
  { value: 'social_score', label: '社交状态' },
  { value: 'creativity_score', label: '创造力' },
]

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<LifeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // 表单状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0])
  const [impactLevel, setImpactLevel] = useState(5)
  const [affectedStats, setAffectedStats] = useState<string[]>([])
  const [tags, setTags] = useState('')

  // 加载数据
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    if (!user) return
    try {
      const data = await getLifeEvents(user.id, 50)
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setEventDate(new Date().toISOString().split('T')[0])
    setImpactLevel(5)
    setAffectedStats([])
    setTags('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const eventData = {
        user_id: user.id,
        title,
        description,
        event_date: eventDate,
        impact_level: impactLevel,
        affected_stats: affectedStats,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      if (editingId) {
        await updateLifeEvent(editingId, eventData)
      } else {
        await createLifeEvent(eventData)
      }
      
      await loadEvents()
      resetForm()
      setShowForm(false)
      alert(editingId ? '更新成功！' : '保存成功！')
    } catch (error) {
      console.error('Error saving event:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    
    try {
      await deleteLifeEvent(id)
      await loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('删除失败')
    }
  }

  const handleEdit = (event: LifeEvent) => {
    setEditingId(event.id)
    setTitle(event.title)
    setDescription(event.description || '')
    setEventDate(event.event_date)
    setImpactLevel(event.impact_level || 5)
    setAffectedStats(event.affected_stats || [])
    setTags(event.tags?.join(', ') || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleStat = (stat: string) => {
    setAffectedStats(prev =>
      prev.includes(stat)
        ? prev.filter(s => s !== stat)
        : [...prev, stat]
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">经历事件</h1>
          <p className="text-gray-400 mt-1">记录人生中的重要时刻</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? '取消' : '添加事件'}
        </Button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <Card title={editingId ? '编辑事件' : '添加新事件'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">事件标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入事件名称..."
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">发生日期 *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  影响程度: {impactLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={impactLevel}
                  onChange={(e) => setImpactLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${impactLevel * 10}%, #374151 ${impactLevel * 10}%, #374151 100%)`,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">影响的属性</label>
              <div className="flex flex-wrap gap-2">
                {statOptions.map((stat) => (
                  <button
                    key={stat.value}
                    type="button"
                    onClick={() => toggleStat(stat.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      affectedStats.includes(stat.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">标签</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分隔，如：工作, 成就, 里程碑"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">事件描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="详细描述这个事件..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {editingId ? '更新' : '保存'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消编辑
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* 事件列表 */}
      <Card title="事件列表" subtitle={`共 ${events.length} 条记录`}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无记录</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <span className="text-sm text-gray-400">{event.event_date}</span>
                    </div>
                    {event.description && (
                      <p className="text-gray-400 mb-3">{event.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center text-purple-400">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm">影响 {event.impact_level}/10</span>
                      </div>
                      {event.affected_stats && event.affected_stats.length > 0 && (
                        <div className="flex gap-1">
                          {event.affected_stats.map((stat) => (
                            <span key={stat} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                              {statOptions.find(s => s.value === stat)?.label}
                            </span>
                          ))}
                        </div>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex gap-1">
                          {event.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-900/50 rounded text-xs text-blue-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

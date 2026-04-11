'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Star, Trash2, Edit2, X } from 'lucide-react'
import { getLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { LifeEvent } from '@/types'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ManagedImage } from '@/components/ui/ManagedImage'
import { useToast } from '@/components/ui/Toast'
import { useConfirm, ConfirmDialog } from '@/components/ui/ConfirmDialog'

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
  const { toast } = useToast()
  const { confirm, cancel, dialogState } = useConfirm()
  const [events, setEvents] = useState<LifeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0])
  const [impactLevel, setImpactLevel] = useState(5)
  const [affectedStats, setAffectedStats] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tagList, setTagList] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])

  const loadEvents = useCallback(async () => {
    if (!user) return
    try {
      const data = await getLifeEvents(user.id, 50)
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      void loadEvents()
    }
  }, [user, loadEvents])

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setEventDate(new Date().toISOString().split('T')[0])
    setImpactLevel(5)
    setAffectedStats([])
    setTagInput('')
    setTagList([])
    setImages([])
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
        tags: tagList.length > 0 ? tagList : null,
        images: images.length > 0 ? images : null,
      }

      if (editingId) {
        await updateLifeEvent(editingId, eventData)
      } else {
        await createLifeEvent(eventData)
      }
      
      await loadEvents()
      resetForm()
      setShowForm(false)
      toast(editingId ? '更新成功！' : '保存成功！', 'success')
    } catch (error) {
      console.error('Error saving event:', error)
      toast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ message: '确定要删除这条记录吗？', variant: 'danger' })
    if (!confirmed) return
    
    try {
      await deleteLifeEvent(id)
      await loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast('删除失败', 'error')
    }
  }

  const handleEdit = (event: LifeEvent) => {
    setEditingId(event.id)
    setTitle(event.title)
    setDescription(event.description || '')
    setEventDate(event.event_date)
    setImpactLevel(event.impact_level || 5)
    setAffectedStats(event.affected_stats || [])
    setTagInput('')
    setTagList(event.tags || [])
    setImages(event.images || [])
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

  const impactLabel = impactLevel <= 3 ? '轻微影响' : impactLevel <= 7 ? '中等影响' : '重大影响'

  const appendTag = () => {
    const normalized = tagInput.trim().replace(/^#/, '')
    if (!normalized) return
    if (tagList.includes(normalized)) {
      setTagInput('')
      return
    }
    setTagList((prev) => [...prev, normalized])
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTagList((prev) => prev.filter((item) => item !== tag))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-bright)' }}>经历事件</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>记录人生中的重要时刻</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? '取消' : '添加事件'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? '编辑事件' : '添加新事件'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="pg-card-soft p-4 space-y-4">
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>基础信息</div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>事件标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入事件名称..."
                  required
                  className="pg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>发生日期 *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="pg-input"
                />
              </div>
            </div>

            <div className="pg-card-soft p-4 space-y-4">
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>影响评估</div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>影响程度: {impactLevel}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={impactLevel}
                  onChange={(e) => setImpactLevel(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--dash-stat-social) 0%, var(--dash-stat-social) ${impactLevel * 10}%, var(--dash-border) ${impactLevel * 10}%, var(--dash-border) 100%)`,
                  }}
                />
                <div className="mt-2 text-xs" style={{ color: 'var(--dash-stat-social)' }}>{impactLabel}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>影响的属性</label>
                <div className="flex flex-wrap gap-2">
                  {statOptions.map((stat) => (
                    <button
                      key={stat.value}
                      type="button"
                      onClick={() => toggleStat(stat.value)}
                      className="px-3 py-1 rounded-full text-sm transition-colors"
                      style={{
                        background: affectedStats.includes(stat.value) ? 'var(--accent)' : 'var(--dash-card-soft)',
                        color: affectedStats.includes(stat.value) ? 'var(--bg)' : 'var(--text-muted)',
                        border: `1px solid ${affectedStats.includes(stat.value) ? 'var(--accent)' : 'var(--dash-border)'}`,
                      }}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pg-card-soft p-4 space-y-4">
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>内容与素材</div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>标签</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      appendTag()
                    }
                  }}
                  onBlur={appendTag}
                  placeholder="输入后按回车，如：里程碑"
                  className="pg-input"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagList.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="px-2 py-0.5 rounded-full text-xs transition-colors"
                        style={{ background: 'var(--dash-card-soft)', border: '1px solid var(--dash-border)', color: 'var(--text-muted)' }}
                      >
                        #{tag} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>事件描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="详细描述这个事件..."
                  rows={4}
                  className="pg-input resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>图片记录 (可选)</label>
                <ImageUpload images={images} onChange={setImages} maxImages={6} />
              </div>
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

      <Card title="事件列表" subtitle={`共 ${events.length} 条记录`}>
        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>加载中...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无记录</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="pg-card-soft p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex gap-4">
                    {event.images && event.images.length > 0 && (
                      <ManagedImage
                        src={event.images[0]}
                        alt={`${event.title} 配图`}
                        width={80}
                        height={80}
                        sizes="80px"
                        className="h-20 w-20 rounded-lg flex-shrink-0"
                        style={{ border: '1px solid var(--dash-border)' }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-bright)' }}>{event.title}</h3>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.event_date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ border: '1px solid var(--dash-border)', color: 'var(--dash-info)', background: 'var(--dash-card-soft)' }}>
                          影响 {event.impact_level}/10
                        </span>
                      </div>
                      {event.description && (
                        <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center" style={{ color: 'var(--dash-info)' }}>
                          <Star className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {event.impact_level && event.impact_level <= 3
                              ? '轻微影响'
                              : event.impact_level && event.impact_level <= 7
                                ? '中等影响'
                                : '重大影响'}
                          </span>
                        </div>
                        {event.affected_stats && event.affected_stats.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {event.affected_stats.map((stat) => (
                              <span key={stat} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--dash-card-soft)', color: 'var(--text-muted)' }}>
                                {statOptions.find(s => s.value === stat)?.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {event.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--dash-card-soft)', color: 'var(--text-muted)' }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {event.images && event.images.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {event.images.slice(1).map((img, idx) => (
                          <ManagedImage
                            key={idx}
                            src={img}
                            alt={`${event.title} 配图 ${idx + 2}`}
                            width={56}
                            height={56}
                            sizes="56px"
                            className="h-14 w-14 rounded flex-shrink-0"
                            style={{ border: '1px solid var(--dash-border)' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1 transition-colors"
                      style={{ color: 'var(--text-dim)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 transition-colors"
                      style={{ color: 'var(--text-dim)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dash-danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
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

      <ConfirmDialog
        open={dialogState.open}
        onConfirm={dialogState.onConfirm}
        onCancel={cancel}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Lightbulb, Calendar, Plus, Trash2 } from 'lucide-react'
import { getThoughts, createThought, deleteThought } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { Thought } from '@/types'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ManagedImage } from '@/components/ui/ManagedImage'

const quickTemplates = ['今天最大的收获是', '我准备开始做', '一个值得复盘的问题']

export default function ThoughtsPage() {
  const { user } = useAuth()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newThought, setNewThought] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)

  // 加载数据
  useEffect(() => {
    loadThoughts()
  }, [])

  const loadThoughts = async () => {
    try {
      const data = await getThoughts(50)
      setThoughts(data)
    } catch (error) {
      console.error('Error loading thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newThought.trim()) return

    setSaving(true)
    try {
      await createThought({ 
        content: newThought.trim(),
        images: images.length > 0 ? images : null 
      })
      setNewThought('')
      setImages([])
      setShowForm(false)
      await loadThoughts()
    } catch (error) {
      console.error('Error saving thought:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条想法吗？')) return

    try {
      await deleteThought(id)
      await loadThoughts()
    } catch (error) {
      console.error('Error deleting thought:', error)
      alert('删除失败')
    }
  }

  const applyTemplate = (template: string) => {
    if (!newThought.trim()) {
      setNewThought(`${template} `)
      return
    }
    setNewThought(prev => `${prev}\n${template} `)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>想法与灵感</h1>
          <p style={{ color: 'var(--text-muted)' }}>记录瞬间的思考与感悟</p>
        </div>
        {user && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            添加想法
          </Button>
        )}
      </div>

      {showForm && user && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit}>
            <Textarea
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              placeholder="记录你的想法..."
              rows={4}
              className="mb-4"
            />
            <div className="mb-4 flex flex-wrap gap-2">
              {quickTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="px-2.5 py-1 text-xs rounded-full transition-colors"
                  style={{
                    border: '1px solid var(--dash-border)',
                    color: 'var(--text-bright)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; e.currentTarget.style.color = '#93c5fd' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--dash-border)'; e.currentTarget.style.color = 'var(--text-bright)' }}
                >
                  {template}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-bright)' }}>配图 (可选)</label>
              <ImageUpload images={images} onChange={setImages} maxImages={9} />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving || !newThought.trim()}
              >
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="secondary"
              >
                取消
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>加载中...</div>
      ) : thoughts.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>暂无想法记录</div>
      ) : (
        <div className="grid gap-6">
          {thoughts.map((thought) => (
            <div
              className="relative transition-colors rounded-xl"
              style={{ border: '1px solid var(--dash-border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--dash-border)' }}
            >
            <Card key={thought.id} className="border-0 shadow-none">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text)' }}>
                    {thought.content}
                  </p>
                  {thought.images && thought.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {thought.images.map((img, idx) => (
                        <ManagedImage
                          key={idx}
                          src={img}
                          alt={`想法配图 ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 30vw, 160px"
                          className="aspect-square rounded-md"
                          style={{ border: '1px solid var(--dash-border)' }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm" style={{ color: 'var(--text-dim)' }}>
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(thought.created_at).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {user && (
                      <button
                        onClick={() => handleDelete(thought.id)}
                        className="p-1 transition-colors"
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

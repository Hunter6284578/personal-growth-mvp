'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Lightbulb, Calendar, Plus, Trash2 } from 'lucide-react'
import { getThoughts, createThought, deleteThought } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { Thought } from '@/types'

export default function ThoughtsPage() {
  const { user } = useAuth()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newThought, setNewThought] = useState('')
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
      await createThought({ content: newThought.trim() })
      setNewThought('')
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">想法与灵感</h1>
          <p className="text-gray-400">记录瞬间的思考与感悟</p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加想法
          </button>
        )}
      </div>

      {/* 添加表单 */}
      {showForm && user && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              placeholder="记录你的想法..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !newThought.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 想法列表 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : thoughts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无想法记录</div>
      ) : (
        <div className="grid gap-6">
          {thoughts.map((thought) => (
            <Card key={thought.id} className="relative">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {thought.content}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
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
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

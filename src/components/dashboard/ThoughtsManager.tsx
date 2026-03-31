'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Thought } from '@/types'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Trash2, Tag, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface ThoughtsManagerProps {
  initialThoughts: Thought[]
  userId: string
}

const quickTags = ['复盘', '学习', '灵感', '执行', '情绪', '健康']

export function ThoughtsManager({ initialThoughts, userId }: ThoughtsManagerProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts)
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddThought = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    
    // Process tags: split by comma, trim, remove empty
    const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .insert({
          user_id: userId,
          content: content.trim(),
          tags: tags.length > 0 ? tags : null,
          images: images.length > 0 ? images : null
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setThoughts([data as Thought, ...thoughts])
        setContent('')
        setTagsInput('')
        setImages([])
        router.refresh() // Refresh server components if needed
      }
    } catch (error) {
      console.error('Error adding thought:', error)
      alert('添加想法失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteThought = async (id: string) => {
    if (!confirm('确定要删除这条想法吗？')) return

    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setThoughts(thoughts.filter(t => t.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Error deleting thought:', error)
      alert('删除失败，请重试')
    }
  }

  const appendQuickTag = (tag: string) => {
    const currentTags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean)
    if (currentTags.includes(tag)) return
    setTagsInput(currentTags.length > 0 ? `${currentTags.join(', ')}, ${tag}` : tag)
  }

  return (
    <div className="space-y-8">
      <Card title="记录灵感" subtitle="随时捕捉你的想法">
        <form onSubmit={handleAddThought} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="此刻你在想什么？"
            rows={3}
            className="w-full"
            disabled={loading}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              配图 (可选)
            </label>
            <ImageUpload images={images} onChange={setImages} maxImages={9} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="标签 (用逗号分隔)"
                className="pg-input pl-9 text-sm"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" disabled={loading || !content.trim()} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  保存想法
                </>
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => appendQuickTag(tag)}
                className="px-2.5 py-1 text-xs rounded-full border border-gray-600 text-gray-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
                disabled={loading}
              >
                #{tag}
              </button>
            ))}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          我的想法 
          <span className="text-sm font-normal text-gray-400">({thoughts.length})</span>
        </h2>
        
        {thoughts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thoughts.map((thought) => (
              <div 
                key={thought.id} 
                className="pg-card p-5 flex flex-col hover:border-gray-600 transition-colors group relative"
              >
                <button
                  onClick={() => handleDeleteThought(thought.id)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <p className="text-gray-200 whitespace-pre-wrap flex-grow mb-4">
                  {thought.content}
                </p>

                {thought.images && thought.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {thought.images.map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-full aspect-square object-cover rounded-md border border-gray-700" />
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                  <span className="text-xs text-gray-500">
                    {new Date(thought.created_at).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  {thought.tags && thought.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
                      {thought.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-700/50 text-blue-300 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <LightbulbIcon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">还没有记录任何想法</p>
            <p className="text-sm text-gray-500 mt-1">记录下第一个灵感吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

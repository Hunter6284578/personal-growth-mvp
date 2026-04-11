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
import { ManagedImage } from '@/components/ui/ManagedImage'
import { useToast } from '@/components/ui/Toast'
import { useConfirm, ConfirmDialog } from '@/components/ui/ConfirmDialog'

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
  const { toast } = useToast()
  const { confirm, cancel, dialogState } = useConfirm()

  const handleAddThought = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    
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
        router.refresh()
      }
    } catch (error) {
      console.error('Error adding thought:', error)
      toast('添加想法失败，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteThought = async (id: string) => {
    const confirmed = await confirm({ message: '确定要删除这条想法吗？', variant: 'danger' })
    if (!confirmed) return

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
      toast('删除失败，请重试', 'error')
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
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              配图 (可选)
            </label>
            <ImageUpload images={images} onChange={setImages} maxImages={9} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
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
                className="px-2.5 py-1 text-xs rounded-full border transition-colors"
                style={{ borderColor: 'var(--dash-border)', color: 'var(--text)' }}
                disabled={loading}
              >
                #{tag}
              </button>
            ))}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-bright)' }}>
          我的想法 
          <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({thoughts.length})</span>
        </h2>
        
        {thoughts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thoughts.map((thought) => (
              <div 
                key={thought.id} 
                className="pg-card p-5 flex flex-col transition-colors group relative"
              >
                <button
                  onClick={() => handleDeleteThought(thought.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-dim)' }}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <p className="whitespace-pre-wrap flex-grow mb-4" style={{ color: 'var(--text)' }}>
                  {thought.content}
                </p>

                {thought.images && thought.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
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
                
                <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid var(--dash-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
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
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
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
          <div className="text-center py-12 rounded-lg border border-dashed" style={{ background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--dash-card-soft)' }}>
              <LightbulbIcon className="w-8 h-8" style={{ color: 'var(--text-dim)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>还没有记录任何想法</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>记录下第一个灵感吧！</p>
          </div>
        )}
      </div>

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

function LightbulbIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
      style={style}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

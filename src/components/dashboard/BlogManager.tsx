'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BlogPost } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Trash2, Edit2, Plus, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface BlogManagerProps {
  initialPosts: BlogPost[]
  userId: string
}

export function BlogManager({ initialPosts, userId }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  const resetForm = () => {
    setCurrentPostId(null)
    setTitle('')
    setSlug('')
    setSummary('')
    setContent('')
    setTagsInput('')
    setImages([])
    setStatus('draft')
    setIsEditing(false)
  }

  const handleEditClick = (post: BlogPost) => {
    setCurrentPostId(post.id)
    setTitle(post.title)
    setSlug(post.slug)
    setSummary(post.summary || '')
    setContent(post.content)
    setTagsInput(post.tags ? post.tags.join(', ') : '')
    setImages(post.images || [])
    setStatus(post.status)
    setIsEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    
    const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    const postData = {
      user_id: userId,
      title: title.trim(),
      slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-'),
      summary: summary.trim() || null,
      content: content.trim(),
      tags: tags.length > 0 ? tags : null,
      images: images.length > 0 ? images : null,
      status,
      // Only update published_at if status is published
      ...(status === 'published' && { published_at: new Date().toISOString() })
    }

    try {
      let data, error

      if (currentPostId) {
        // Update
        const result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', currentPostId)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
        // Create
        const result = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single()
        data = result.data
        error = result.error
      }

      if (error) throw error

      if (data) {
        if (currentPostId) {
          setPosts(posts.map(p => p.id === currentPostId ? (data as BlogPost) : p))
        } else {
          setPosts([data as BlogPost, ...posts])
        }
        resetForm()
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('保存文章失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPosts(posts.filter(p => p.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <div className="space-y-8">
      {!isEditing && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            文章列表 
            <span className="text-sm font-normal text-gray-400">({posts.length})</span>
          </h2>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            写文章
          </Button>
        </div>
      )}

      {isEditing && (
        <Card title={currentPostId ? '编辑文章' : '写新文章'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="文章标题"
                required
              />
              <Input
                label="Slug (URL路径)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-post-slug (留空则自动生成)"
              />
            </div>
            
            <Textarea
              label="摘要"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简短的介绍..."
              rows={2}
            />
            
            <Textarea
              label="正文内容 (支持 Markdown)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作..."
              rows={15}
              required
              className="font-mono"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                配图 (可选)
              </label>
              <ImageUpload images={images} onChange={setImages} maxImages={5} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="标签"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="技术, 成长, 随笔 (用逗号分隔)"
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  发布状态
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="form-radio text-blue-500"
                    />
                    <span className="text-gray-300">草稿</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="form-radio text-green-500"
                    />
                    <span className="text-gray-300">发布</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Button type="button" variant="ghost" onClick={resetForm} disabled={loading}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存文章'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!isEditing && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="pg-card p-5 hover:border-gray-600 transition-colors flex flex-col md:flex-row gap-5 justify-between items-start"
                >
                  {post.images && post.images.length > 0 && (
                    <img src={post.images[0]} alt="" className="h-20 w-28 rounded-lg border border-gray-700 object-cover flex-shrink-0" />
                  )}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{post.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${
                        post.status === 'published' 
                          ? 'bg-green-900/30 border-green-800 text-green-400' 
                          : 'bg-gray-700 border-gray-600 text-gray-400'
                      }`}>
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    
                    {post.summary && (
                      <p className="text-gray-400 text-sm line-clamp-2">{post.summary}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {post.slug}
                      </span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2">
                          {post.tags.map(tag => (
                            <span key={tag}>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {post.images && post.images.length > 1 && (
                      <div className="flex gap-2 pt-3 overflow-x-auto">
                        {post.images.slice(1).map((img, idx) => (
                          <img key={idx} src={img} alt="" className="h-14 w-14 object-cover rounded border border-gray-700" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditClick(post)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400">还没有写过文章</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsEditing(true)}
              >
                开始第一篇创作
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

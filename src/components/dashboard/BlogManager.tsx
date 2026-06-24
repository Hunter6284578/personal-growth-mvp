'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BlogPost } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Trash2, Edit2, Plus, Loader2, FileText, ImagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ManagedImage } from '@/components/ui/ManagedImage'
import { useToast } from '@/components/ui/Toast'
import { useConfirm, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { uploadImage } from '@/lib/upload'

interface BlogManagerProps {
  initialPosts: BlogPost[]
  userId: string
}

export function BlogManager({ initialPosts, userId }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { confirm, cancel, dialogState } = useConfirm()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const inlineImageInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false)

  const resetForm = () => {
    setCurrentPostId(null)
    setTitle('')
    setSlug('')
    setCategory('')
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
    setCategory(post.category || '')
    setSummary(post.summary || '')
    setContent(post.content)
    setTagsInput(post.tags ? post.tags.join(', ') : '')
    setImages(post.images || [])
    setStatus(post.status)
    setIsEditing(true)
  }

  const insertContentAtCursor = (snippet: string) => {
    const textarea = contentRef.current

    if (!textarea) {
      setContent((prev) => `${prev}${prev.trim() ? '\n\n' : ''}${snippet}`)
      return
    }

    const start = textarea.selectionStart ?? content.length
    const end = textarea.selectionEnd ?? content.length
    const before = content.slice(0, start)
    const after = content.slice(end)
    const prefix = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
    const suffix = after && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : ''
    const nextContent = `${before}${prefix}${snippet}${suffix}${after}`
    const cursor = before.length + prefix.length + snippet.length

    setContent(nextContent)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const handleInlineImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setUploadingInlineImage(true)

    try {
      const uploadedUrls: string[] = []
      const snippets: string[] = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast('只能上传图片文件', 'error')
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast('图片大小不能超过 5MB', 'error')
          continue
        }

        const url = await uploadImage(file)
        const alt = file.name.replace(/\.[^.]+$/, '') || '文章图片'
        uploadedUrls.push(url)
        snippets.push(`![${alt}](${url})`)
      }

      if (snippets.length) {
        insertContentAtCursor(snippets.join('\n\n'))
        setImages((currentImages) => Array.from(new Set([...currentImages, ...uploadedUrls])))
        toast('图片已插入正文', 'success')
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      toast('上传图片失败，请重试', 'error')
    } finally {
      setUploadingInlineImage(false)
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = ''
      }
    }
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
      category: category.trim() || null,
      summary: summary.trim() || null,
      content: content.trim(),
      tags: tags.length > 0 ? tags : null,
      images: images.length > 0 ? images : null,
      status,
      ...(status === 'published' && { published_at: new Date().toISOString() })
    }

    try {
      let data, error

      if (currentPostId) {
        const result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', currentPostId)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
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
      toast('保存文章失败，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    const confirmed = await confirm({ message: '确定要删除这篇文章吗？', variant: 'danger' })
    if (!confirmed) return

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
      toast('删除失败，请重试', 'error')
    }
  }

  return (
    <div className="space-y-8">
      {!isEditing && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-bright)' }}>
            文章列表 
            <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({posts.length})</span>
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
            
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="主分类 / 系列"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Bug 复盘 / 深度学习 / 大模型 / 项目记录"
                list="blog-category-suggestions"
              />
              <datalist id="blog-category-suggestions">
                <option value="Bug 复盘" />
                <option value="深度学习" />
                <option value="大模型" />
                <option value="医工笔记" />
                <option value="项目记录" />
                <option value="随笔" />
              </datalist>
              <Textarea
                label="摘要"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="简短的介绍..."
                rows={2}
              />
            </div>
            
            <div className="space-y-1">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  正文内容
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inlineImageInputRef.current?.click()}
                  disabled={uploadingInlineImage}
                >
                  {uploadingInlineImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 mr-2" />
                  )}
                  插入图片
                </Button>
              </div>
              <Textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始写作..."
                rows={18}
                required
                className="font-mono"
              />
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleInlineImageChange}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="标签"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="技术, 项目, 随笔 (用逗号分隔)"
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  发布状态
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="form-radio"
                    />
                    <span style={{ color: 'var(--text)' }}>草稿</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="form-radio"
                    />
                    <span style={{ color: 'var(--text)' }}>发布</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4" style={{ borderTop: '1px solid var(--dash-border)' }}>
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
                  className="pg-card p-5 transition-colors flex flex-col md:flex-row gap-5 justify-between items-start"
                >
                  {post.images && post.images.length > 0 && (
                    <ManagedImage
                      src={post.images[0]}
                      alt={`${post.title} 配图`}
                      width={112}
                      height={80}
                      sizes="112px"
                      className="h-20 w-28 rounded-lg flex-shrink-0"
                      style={{ border: '1px solid var(--dash-border)' }}
                    />
                  )}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-bright)' }}>{post.title}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full border" style={
                        post.status === 'published'
                          ? { background: 'rgba(107, 143, 113, 0.2)', borderColor: 'rgba(107, 143, 113, 0.3)', color: 'var(--dash-success)' }
                          : { background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)', color: 'var(--text-muted)' }
                      }>
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    
                    {post.summary && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.summary}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs pt-2" style={{ color: 'var(--text-dim)' }}>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {post.slug}
                      </span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      {post.category ? <span>{post.category}</span> : null}
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
                          <ManagedImage
                            key={idx}
                            src={img}
                            alt={`${post.title} 配图 ${idx + 2}`}
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
                      style={{ color: 'var(--dash-danger)' }}
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-lg border border-dashed" style={{ background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--dash-card-soft)' }}>
                <FileText className="w-8 h-8" style={{ color: 'var(--text-dim)' }} />
              </div>
              <p style={{ color: 'var(--text-muted)' }}>还没有写过文章</p>
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

'use client'

import { useState } from 'react'
import { MessageCircle, Pin, PinOff, Send, Trash2 } from 'lucide-react'
import type { BlogComment } from '@/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface CommentsSectionProps {
  postId: string
  initialComments: BlogComment[]
  isSiteOwner?: boolean
}

export function CommentsSection({ postId, initialComments, isSiteOwner = false }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (website.trim()) {
      setMessage('评论已提交，等待审核。')
      return
    }

    if (!authorName.trim() || !content.trim()) {
      setError('请填写昵称和评论内容。')
      return
    }

    setLoading(true)

    const trimmedName = authorName.trim().slice(0, 40)
    const trimmedEmail = authorEmail.trim() || null
    const trimmedContent = content.trim().slice(0, 2000)

    const { error: insertError } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        author_name: trimmedName,
        author_email: trimmedEmail,
        content: trimmedContent,
        status: 'approved',
      })

    setLoading(false)

    if (insertError) {
      setError('评论提交失败，请稍后再试。')
      return
    }

    const now = new Date().toISOString()
    const newComment: BlogComment = {
      id: crypto.randomUUID(),
      post_id: postId,
      author_name: trimmedName,
      author_email: trimmedEmail,
      website: null,
      content: trimmedContent,
      status: 'approved',
      is_pinned: false,
      created_at: now,
      updated_at: now,
    }

    setComments((prev) => [...prev, newComment])
    setAuthorName('')
    setAuthorEmail('')
    setContent('')
    setMessage('评论发布成功')
  }

  const deleteComment = async (commentId: string) => {
    if (!window.confirm('确定要删除这条评论吗？')) return

    const { error: deleteError } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      setError('删除评论失败，请稍后再试。')
      return
    }

    setComments((prev) => prev.filter((item) => item.id !== commentId))
  }

  const togglePin = async (commentId: string, currentPinned: boolean) => {
    const { error: updateError } = await supabase
      .from('blog_comments')
      .update({ is_pinned: !currentPinned })
      .eq('id', commentId)

    if (updateError) {
      setError('更新置顶状态失败，请稍后再试。')
      return
    }

    setComments((prev) => {
      const updated = prev.map((item) =>
        item.id === commentId ? { ...item, is_pinned: !currentPinned } : item
      )
      return [...updated].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
    })
  }

  return (
    <section className="comments-section">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-5 w-5" style={{ color: 'var(--accent)' }} />
        <div>
          <p className="eyebrow">Comments</p>
          <h2 className="mt-1 text-xl font-normal" style={{ color: 'var(--text-bright)' }}>
            读者留言
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="comment-item">
              <div className="flex flex-wrap items-center gap-3">
                <strong style={{ color: 'var(--text-bright)' }}>{comment.author_name}</strong>
                {comment.is_pinned ? (
                  <span
                    className="rounded px-2 py-0.5 text-xs font-medium"
                    style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                  >
                    置顶
                  </span>
                ) : null}
                <span className="date-note">
                  {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                </span>
                {isSiteOwner ? (
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => togglePin(comment.id, comment.is_pinned)}
                      className="inline-flex items-center text-xs transition-colors hover:text-[var(--accent)]"
                      style={{ color: 'var(--text-dim)' }}
                      aria-label={comment.is_pinned ? '取消置顶' : '置顶'}
                    >
                      {comment.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      <span className="ml-1">{comment.is_pinned ? '取消置顶' : '置顶'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteComment(comment.id)}
                      className="inline-flex items-center text-xs transition-colors hover:text-[var(--dash-danger)]"
                      style={{ color: 'var(--text-dim)' }}
                      aria-label="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="ml-1">删除</span>
                    </button>
                  </div>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap leading-7" style={{ color: 'var(--text-muted)' }}>
                {comment.content}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            还没有公开评论。
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="昵称"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            maxLength={40}
            required
          />
          <Input
            label="邮箱（不会公开）"
            type="email"
            value={authorEmail}
            onChange={(event) => setAuthorEmail(event.target.value)}
          />
        </div>
        <input
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <Textarea
          label="评论"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          maxLength={2000}
          required
        />

        {message ? <p className="text-sm" style={{ color: 'var(--accent)' }}>{message}</p> : null}
        {error ? <p className="text-sm" style={{ color: 'var(--dash-danger)' }}>{error}</p> : null}

        <Button type="submit" disabled={loading}>
          <Send className="h-4 w-4 mr-2" />
          {loading ? '提交中...' : '提交评论'}
        </Button>
      </form>
    </section>
  )
}

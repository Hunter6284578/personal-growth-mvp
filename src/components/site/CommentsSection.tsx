'use client'

import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import type { BlogComment } from '@/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface CommentsSectionProps {
  postId: string
  initialComments: BlogComment[]
}

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments] = useState(initialComments)
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

    const { error: insertError } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        author_name: authorName.trim().slice(0, 40),
        author_email: authorEmail.trim() || null,
        content: content.trim().slice(0, 2000),
        status: 'pending',
      })

    setLoading(false)

    if (insertError) {
      setError('评论提交失败，请稍后再试。')
      return
    }

    setAuthorName('')
    setAuthorEmail('')
    setContent('')
    setMessage('评论已提交，审核后会显示在文章下方。')
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
                <span className="date-note">
                  {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                </span>
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

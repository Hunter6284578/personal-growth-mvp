'use client'

import { useState } from 'react'
import { Pin, PinOff, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { BlogComment } from '@/types'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useConfirm, ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface ManagedComment extends BlogComment {
  blog_posts?: {
    title: string
    slug: string
  } | null
}

interface CommentsManagerProps {
  initialComments: ManagedComment[]
}

export function CommentsManager({ initialComments }: CommentsManagerProps) {
  const [comments, setComments] = useState(initialComments)
  const { toast } = useToast()
  const { confirm, cancel, dialogState } = useConfirm()

  const togglePin = async (id: string, currentPinned: boolean) => {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ is_pinned: !currentPinned })
      .eq('id', id)
      .select('*, blog_posts(title, slug)')
      .single()

    if (error) {
      toast('更新置顶状态失败', 'error')
      return
    }

    setComments((items) => {
      const updated = items.map((item) => (item.id === id ? (data as ManagedComment) : item))
      return [...updated].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    })
    toast(currentPinned ? '已取消置顶' : '已置顶', 'success')
  }

  const deleteComment = async (id: string) => {
    const ok = await confirm({ message: '确定要删除这条评论吗？', variant: 'danger' })
    if (!ok) return

    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', id)

    if (error) {
      toast('删除评论失败', 'error')
      return
    }

    setComments((items) => items.filter((item) => item.id !== id))
    toast('评论已删除', 'success')
  }

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <article key={comment.id} className="pg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <strong style={{ color: 'var(--text-bright)' }}>{comment.author_name}</strong>
                  {comment.is_pinned ? (
                    <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                      置顶
                    </span>
                  ) : null}
                  <span className="date-note">{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                </div>

                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                  文章：{comment.blog_posts?.title ?? '未知文章'}
                </p>

                {comment.author_email ? (
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    邮箱：{comment.author_email}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => togglePin(comment.id, comment.is_pinned)}>
                  {comment.is_pinned ? <PinOff className="mr-1 h-4 w-4" /> : <Pin className="mr-1 h-4 w-4" />}
                  {comment.is_pinned ? '取消置顶' : '置顶'}
                </Button>
                <Button size="sm" variant="ghost" style={{ color: 'var(--dash-danger)' }} onClick={() => deleteComment(comment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap leading-7" style={{ color: 'var(--text-muted)' }}>
              {comment.content}
            </p>
          </article>
        ))
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center" style={{ borderColor: 'var(--dash-border)', color: 'var(--text-muted)' }}>
          暂时没有评论。
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

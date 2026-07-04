import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { isSiteAdmin } from '@/lib/site-admin'
import { CommentsManager } from '@/components/dashboard/CommentsManager'

export const dynamic = 'force-dynamic'

export default async function CommentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isSiteAdmin(supabase, user)

  if (!admin) {
    redirect('/login')
  }

  const { data: comments } = await supabase
    .from('blog_comments')
    .select('*, blog_posts(title, slug)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>评论管理</h1>
        <p style={{ color: 'var(--text-muted)' }}>管理文章评论，可置顶和删除。</p>
      </div>

      <CommentsManager initialComments={comments ?? []} />
    </div>
  )
}

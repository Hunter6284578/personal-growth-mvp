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
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>评论审核</h1>
        <p style={{ color: 'var(--text-muted)' }}>审核访客提交的评论，只有通过后的评论会显示在文章页。</p>
      </div>

      <CommentsManager initialComments={comments ?? []} />
    </div>
  )
}

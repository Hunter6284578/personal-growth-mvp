import { createClient } from '@/lib/supabase-server'
import { BlogManager } from '@/components/dashboard/BlogManager'
import { isSiteAdmin } from '@/lib/site-admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isSiteAdmin(supabase, user)

  if (!admin) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>博客管理</h1>
        <p style={{ color: 'var(--text-muted)' }}>撰写和管理你的博客文章</p>
      </div>

      <BlogManager 
        initialPosts={posts || []} 
        userId={user.id} 
      />
    </div>
  )
}

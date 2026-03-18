import { createClient } from '@/lib/supabase-server'
import { BlogManager } from '@/components/dashboard/BlogManager'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">博客管理</h1>
        <p className="text-gray-400">撰写和管理你的博客文章</p>
      </div>

      <BlogManager 
        initialPosts={posts || []} 
        userId={user.id} 
      />
    </div>
  )
}

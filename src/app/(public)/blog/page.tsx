import { Card } from '@/components/ui/Card'
import { Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { BlogPost } from '@/types'
import Link from 'next/link'

export default async function BlogPage() {
  let posts: BlogPost[] = []
  let error: unknown = null

  try {
    const supabase = await createClient()
    const { data, error: queryError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50)
    if (queryError) throw queryError
    posts = data as BlogPost[]
  } catch (err) {
    error = err
    console.error('Error loading blog posts:', err)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">博客文章</h1>
        <p className="text-gray-400">记录学习、思考与成长</p>
      </div>

      {error ? (
        <div className="text-center py-8 text-red-400">
          加载失败，请稍后重试
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无博客文章
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="hover:border-blue-500 transition-colors cursor-pointer">
                <div className="flex flex-col md:flex-row gap-5">
                  {post.images && post.images.length > 0 && (
                    <img src={post.images[0]} alt="" className="h-28 md:h-32 w-full md:w-48 object-cover rounded-lg border border-gray-700 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">{post.title}</h2>
                    {post.summary && <p className="text-gray-400 mb-4 line-clamp-2">{post.summary}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.max(1, Math.ceil((post.content?.length || 0) / 300))} 分钟阅读
                      </span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/40">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

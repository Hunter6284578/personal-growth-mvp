import { Card } from '@/components/ui/Card'
import { Calendar, Clock } from 'lucide-react'
import { getBlogPosts } from '@/lib/services'

export default async function BlogPage() {
  let posts = []
  let error = null

  try {
    posts = await getBlogPosts('published', 50)
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
            <a key={post.id} href={`/blog/${post.slug}`}>
              <Card className="hover:border-blue-500 transition-colors cursor-pointer">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        5 分钟阅读
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

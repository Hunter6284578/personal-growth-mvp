import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Calendar } from 'lucide-react'
import { getBlogPostBySlug } from '@/lib/services'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  let post = null
  let error = null

  try {
    post = await getBlogPostBySlug(slug)
  } catch (err) {
    error = err
    console.error('Error loading blog post:', err)
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">
          {error ? '加载失败' : '文章未找到'}
        </h1>
        <Link href="/blog">
          <Button variant="primary">返回博客列表</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/blog">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回博客列表
        </Button>
      </Link>

      <article className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-700">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(post.created_at).toLocaleDateString('zh-CN')}
          </span>
          <span>
            更新于 {new Date(post.updated_at).toLocaleDateString('zh-CN')}
          </span>
        </div>

        <div
          className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed prose-p:mb-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}

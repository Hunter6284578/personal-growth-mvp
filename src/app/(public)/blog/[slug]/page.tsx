import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react'
import { getPublishedPostBySlug } from '@/lib/blog'
import { siteConfig } from '@/content/site'
import { getArticleSchema } from '@/lib/structured-data'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

const markdownComponents: Components = {
  h2: ({ children }) => <h2 className="mt-10 text-2xl font-semibold text-stone-950">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold text-stone-950">{children}</h3>,
  p: ({ children }) => <p className="mt-4 text-base leading-8 text-stone-700">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-700">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-stone-700">{children}</ol>,
  li: ({ children }) => <li className="leading-8">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} className="text-teal-700 underline decoration-teal-200 underline-offset-4">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm text-stone-900">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-4 border-stone-300 pl-4 text-stone-600">{children}</blockquote>
  ),
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.summary || post.content.slice(0, 120),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary || post.content.slice(0, 120),
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.summary || post.content.slice(0, 120),
    url: `${siteConfig.siteUrl}/blog/${post.slug}`,
    datePublished: post.created_at,
    dateModified: post.updated_at,
  })

  return (
    <div className="space-y-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
      >
        <ArrowLeft className="h-4 w-4" />
        返回文字列表
      </Link>

      <article className="public-section">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <div className="max-w-3xl space-y-5">
          <div className="space-y-3">
            <p className="eyebrow">正文</p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              {post.title}
            </h1>
            {post.summary ? (
              <p className="text-lg leading-8 text-stone-600">{post.summary}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString('zh-CN')}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {Math.max(1, Math.ceil((post.content?.length || 0) / 320))} 分钟阅读
            </span>
            <span>更新于 {new Date(post.updated_at).toLocaleDateString('zh-CN')}</span>
          </div>

          {post.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-10 max-w-3xl">
          <div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, CalendarDays, Clock3, Link as LinkIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Children, isValidElement } from 'react'

import { getPublishedPostBySlug } from '@/lib/blog'
import { siteConfig } from '@/content/site'
import { getArticleSchema } from '@/lib/structured-data'
import { formatDate, getReadingTimeLabel } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

function extractText(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return String(child)
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      return extractText(child.props.children)
    }

    return ''
  }).join('')
}


function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

function createHeading(level: 'h2' | 'h3') {
  return function Heading({ children }: { children?: ReactNode }) {
    const text = extractText(children ?? '')
    const id = slugifyHeading(text)
    const Tag = level
    const className = level === 'h2'
      ? 'anchor-heading group mt-10 scroll-mt-24 text-2xl font-semibold text-white'
      : 'anchor-heading group mt-8 scroll-mt-24 text-xl font-semibold text-white'

    return (
      <Tag id={id} className={className}>
        <span className="inline-flex items-center">
          {children}
          {id ? (
            <a href={`#${id}`} className="heading-anchor" aria-label={`Jump to ${text}`}>
              <LinkIcon className="h-4 w-4" />
            </a>
          ) : null}
        </span>
      </Tag>
    )
  }
}


const markdownComponents: Components = {
  h2: createHeading('h2'),
  h3: createHeading('h3'),
  p: ({ children }) => <p className="mt-4 text-base leading-8 text-slate-300">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-300">{children}</ol>,
  li: ({ children }) => <li className="leading-8">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} className="text-emerald-200 underline decoration-emerald-400/30 underline-offset-4 transition hover:text-white">
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className)

    if (isBlock) {
      return <code className={className}>{children}</code>
    }

    return (
      <code className="rounded bg-slate-950/60 px-1.5 py-0.5 text-sm text-emerald-100">{children}</code>
    )
  },
  pre: ({ children }) => <pre>{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-emerald-400/30 pl-5 text-slate-300">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
  hr: () => <hr />,
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const lang = await getCurrentLanguage()
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {
      title: lang === 'zh' ? '文章未找到' : 'Post Not Found',
    }
  }

  const description = post.summary || post.content.slice(0, 120)

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const lang = await getCurrentLanguage()
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

  const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 320))

  return (
    <div className="space-y-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {lang === 'zh' ? '返回日志列表' : 'Back to journal'}
      </Link>

      <article className="public-section">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <div className="max-w-3xl space-y-5">
          <div className="space-y-3">
            <p className="eyebrow">{lang === 'zh' ? '正文' : 'Article'}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {post.title}
            </h1>
            {post.summary ? (
              <p className="text-lg leading-8 text-slate-300">{post.summary}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(post.created_at, lang)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {getReadingTimeLabel(readingTime, lang)}
            </span>
            <span>{lang === 'zh' ? '更新于 ' : 'Updated '}{formatDate(post.updated_at, lang)}</span>
          </div>

          {post.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="prose-shell mt-10 max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  )
}

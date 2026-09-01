import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, CalendarDays, Clock3, Link as LinkIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Children, isValidElement } from 'react'

import { getPublishedPostBySlug, getPublishedPosts } from '@/lib/blog'
import { siteConfig } from '@/content/site'
import { getArticleSchema } from '@/lib/structured-data'
import { formatDate, getReadingTimeLabel } from '@/lib/site-language'
import { getCurrentLanguage } from '@/lib/site-language.server'
import ViewCounter from '@/components/site/ViewCounter'

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
      ? 'anchor-heading group mt-10 scroll-mt-24 text-2xl font-semibold'
      : 'anchor-heading group mt-8 scroll-mt-24 text-xl font-semibold'

    return (
      <Tag id={id} className={className} style={{ color: 'var(--text-bright)' }}>
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
  p: ({ children }) => <p className="mt-4 text-base leading-8" style={{ color: 'var(--text-muted)' }}>{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5" style={{ color: 'var(--text-muted)' }}>{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5" style={{ color: 'var(--text-muted)' }}>{children}</ol>,
  li: ({ children }) => <li className="leading-8">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} style={{ color: 'var(--accent)' }} className="underline decoration-[var(--border-hover)] underline-offset-4 transition hover:text-[var(--text-bright)]">
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className)

    if (isBlock) {
      return <code className={className}>{children}</code>
    }

    return (
      <code className="rounded px-1.5 py-0.5 text-sm" style={{ background: 'var(--bg-warm)', color: 'var(--accent)' }}>{children}</code>
    )
  },
  pre: ({ children }) => <pre>{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 pl-5" style={{ borderColor: 'var(--accent)', color: 'var(--text-muted)' }}>{children}</blockquote>
  ),
  img: ({ alt, src }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? ''}
      alt={alt ?? ''}
      className="article-image"
      loading="lazy"
    />
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

  const ogImage = `${siteConfig.siteUrl}/opengraph-image`

  return {
    title: post.title,
    description,
    authors: [{ name: siteConfig.name }],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      url: `${siteConfig.siteUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const lang = await getCurrentLanguage()
  const { slug } = await params
  const [post, posts] = await Promise.all([
    getPublishedPostBySlug(slug),
    getPublishedPosts(),
  ])

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
  const sameSeriesPosts = post.category
    ? posts
        .filter((item) => item.id !== post.id && item.category === post.category)
        .slice(0, 3)
    : []
  return (
    <div className="space-y-6">
      <Link
        href="/blog"
        className="cta-secondary"
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
            <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: 'var(--text-bright)' }}>
              {post.title}
            </h1>
            {post.summary ? (
              <p className="text-lg leading-8" style={{ color: 'var(--text-muted)' }}>{post.summary}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-dim)' }}>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="date-note">{formatDate(post.created_at, lang)}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {getReadingTimeLabel(readingTime, lang)}
            </span>
            <ViewCounter slug={slug} initialCount={post.view_count ?? 0} />
            <span>{lang === 'zh' ? '更新于 ' : 'Updated '}<span className="date-note">{formatDate(post.updated_at, lang)}</span></span>
          </div>

          {post.tags?.length ? (
            <div className="flex flex-wrap gap-3">
              {post.category ? (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="tag-active"
                >
                  {post.category}
                </Link>
              ) : null}
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="tag-minimal"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : post.category ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="tag-active"
              >
                {post.category}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="prose-shell mt-10 max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {sameSeriesPosts.length > 0 ? (
        <section className="series-next">
          <div>
            <p className="eyebrow">{lang === 'zh' ? '同系列' : 'Same Series'}</p>
            <h2 className="mt-2 text-xl font-normal" style={{ color: 'var(--text-bright)' }}>
              {lang === 'zh' ? `继续看「${post.category}」` : `More in ${post.category}`}
            </h2>
          </div>

          <div className="mt-4 space-y-0">
            {sameSeriesPosts.map((item, idx) => (
              <Link
                key={item.id}
                href={`/blog/${item.slug}`}
                className="group block py-4 hover-paper"
                style={{ borderBottom: idx < sameSeriesPosts.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-normal transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-bright)' }}>
                      {item.title}
                    </h3>
                    {item.summary ? (
                      <p className="mt-1 text-sm line-clamp-1" style={{ color: 'var(--text-dim)' }}>{item.summary}</p>
                    ) : null}
                  </div>
                  <span className="date-note shrink-0">{formatDate(item.created_at, lang)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'
import { getSiteUrl } from '@/lib/site-url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const posts = await getPublishedPosts()
  const now = new Date()

  const staticRoutes = ['', '/blog', '/projects', '/about'].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: path === '' ? 1 : path === '/blog' ? 0.8 : 0.6,
  }))

  const blogRoutes = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}

import { getPublishedPosts } from '@/lib/blog'
import { siteConfig } from '@/content/site'

export const revalidate = 3600

export async function GET() {
  const posts = await getPublishedPosts()

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteConfig.siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteConfig.siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.summary || post.content.slice(0, 200))}</description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.siteUrl}</link>
    <description>${escapeXml(siteConfig.description.en)}</description>
    <language>zh-CN</language>
    <atom:link href="${siteConfig.siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

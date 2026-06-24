import { revalidatePath, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const token = (await headers()).get('x-revalidate-token')
  if (!token || token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { type?: string; slug?: string }
  const type = body.type || 'all'

  if (type === 'blog') {
    revalidatePath('/blog')
    if (body.slug) {
      revalidatePath(`/blog/${body.slug}`)
    }
    revalidateTag('blog-posts', 'max')
  } else {
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/projects')
    revalidatePath('/blog')
    revalidatePath('/sitemap.xml')
  }

  return NextResponse.json({ revalidated: true })
}

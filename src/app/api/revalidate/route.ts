import { revalidatePath, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { logError, logInfo } from '@/lib/logger'
import { checkRateLimit, getRequestKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const headerStore = await headers()
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limit = checkRateLimit(getRequestKey(ip, 'api-revalidate'))
  if (limit.limited) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const token = headerStore.get('x-revalidate-token')
  if (!token || token !== process.env.REVALIDATE_TOKEN) {
    logError(new Error('invalid revalidate token'), { endpoint: '/api/revalidate', ip })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { type?: string; slug?: string } | null
  if (body && (typeof body !== 'object' || Array.isArray(body))) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
  }

  const type = body?.type || 'all'
  const slug = body?.slug?.trim()

  if (!['all', 'blog'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type parameter.' }, { status: 400 })
  }

  if (type === 'blog') {
    revalidatePath('/blog')
    if (slug) {
      revalidatePath(`/blog/${slug}`)
    }
    revalidateTag('blog-posts', 'max')
  } else {
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/projects')
    revalidatePath('/fitness')
    revalidatePath('/blog')
    revalidatePath('/sitemap.xml')
  }

  logInfo('revalidate completed', { endpoint: '/api/revalidate', type, slug, ip })
  return NextResponse.json({ revalidated: true })
}

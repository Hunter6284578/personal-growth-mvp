import { revalidatePath, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

export const runtime = 'nodejs'

// 用恒定时间比较 token，避免理论上的时序侧信道泄露。
// 注意：
// 1. timingSafeEqual 要求两个 buffer 长度一致，否则抛错；这里先做长度检查。
// 2. 期望 token 来自 process.env（信任输入），不属于攻击者可控面；
//    此加固针对"内网监听/日志泄露"等次级威胁模型。
// 3. 即使 token 未配置（env 缺失），函数返回 false，永远不会放行。
function verifyToken(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const provided = (await headers()).get('x-revalidate-token')
  if (!verifyToken(provided, process.env.REVALIDATE_TOKEN)) {
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

// 轻量级页面访问统计 — POST /api/track
// 入参：{ path, referrer? }
// 行为：原子地给 page_views(path, today) +1，并异步写一条 event

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
// 不缓存，每次访问都计数
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 用 anon key 但走 service role 风格的 RPC（increment_page_view 是 SECURITY DEFINER）
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

function sha256Short(input: string): string {
  // 仅用于把 IP 脱敏成固定长度的 hash，不存原始 IP
  return createHash('sha256').update(input).digest('hex').slice(0, 16)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      path?: string
      referrer?: string
    }

    // 防御：限制 path 长度和格式（避免有人写超大字符串撑爆数据库）
    const rawPath = typeof body.path === 'string' ? body.path : ''
    const path = rawPath.slice(0, 256) || '/'
    if (path.includes('\n') || path.includes('\r')) {
      return NextResponse.json({ ok: false, reason: 'invalid path' }, { status: 400 })
    }
    const referrer = (typeof body.referrer === 'string' ? body.referrer : '').slice(0, 512)

    // 取 IP（来自反代，由 Next.js 解析 X-Forwarded-For / X-Real-IP）
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      ''
    const ipHash = ip ? sha256Short(ip) : ''

    const userAgent = (req.headers.get('user-agent') || '').slice(0, 512)

    // 1. 原子地 +1（走 RPC，不会并发竞争）
    const { error: rpcErr } = await supabase.rpc('increment_page_view', { p_path: path })
    if (rpcErr) {
      console.error('[track] rpc error', rpcErr.message)
      // 不返回 5xx，避免影响用户访问
    }

    // 2. 异步插一条原始事件（不阻塞响应）
    void supabase
      .from('page_view_events')
      .insert({ path, referrer, user_agent: userAgent, ip_hash: ipHash })
      .then(({ error }) => {
        if (error) console.error('[track] event insert error', error.message)
      })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[track] unhandled', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

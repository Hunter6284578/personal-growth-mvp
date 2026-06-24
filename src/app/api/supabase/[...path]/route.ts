import { NextRequest } from 'next/server'
import { fetchViaPublicDns } from '@/lib/supabase-node-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hopByHopHeaders = new Set([
  'connection',
  'content-length',
  'cookie',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'set-cookie',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

function getSupabaseUrl(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
  }

  const upstream = new URL(supabaseUrl)
  const path = request.nextUrl.pathname.replace(/^\/api\/supabase/, '')

  upstream.pathname = path
  upstream.search = request.nextUrl.search

  return upstream
}

function cloneRequestHeaders(headers: Headers) {
  const result = new Headers()

  headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      result.set(key, value)
    }
  })

  return result
}

function cloneResponseHeaders(headers: Headers) {
  const result = new Headers()

  headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      result.set(key, value)
    }
  })

  return result
}

async function proxySupabase(request: NextRequest) {
  const upstream = getSupabaseUrl(request)
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.arrayBuffer()

  const response = await fetchViaPublicDns(upstream, {
    method: request.method,
    headers: cloneRequestHeaders(request.headers),
    body,
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: cloneResponseHeaders(response.headers),
  })
}

export async function GET(request: NextRequest) {
  return proxySupabase(request)
}

export async function POST(request: NextRequest) {
  return proxySupabase(request)
}

export async function PUT(request: NextRequest) {
  return proxySupabase(request)
}

export async function PATCH(request: NextRequest) {
  return proxySupabase(request)
}

export async function DELETE(request: NextRequest) {
  return proxySupabase(request)
}

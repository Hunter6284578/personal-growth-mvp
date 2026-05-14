import { createBrowserClient } from '@supabase/ssr'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { logError } from '@/lib/logger'

let browserClient: SupabaseClient | null = null

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return { url, key }
}

export function getSupabaseClient() {
  const { url, key } = getSupabaseEnv()

  if (!url || !key) {
    const error = new Error(
      'Supabase public env missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) / Supabase 公共环境变量缺失'
    )
    logError(error, { scope: 'supabase', stage: 'init' })
    throw error
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key)
  }

  return browserClient
}

export function handleSupabaseError(error: PostgrestError | null, context?: Record<string, unknown>) {
  if (!error) return
  logError(error, { scope: 'supabase', code: error.code, ...(context ?? {}) })
  const wrapped = new Error(error.message)
  ;(wrapped as Error & { code?: string }).code = error.code
  throw wrapped
}

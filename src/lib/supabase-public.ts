import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { fetchViaPublicDns } from '@/lib/supabase-node-fetch'

let publicClient: SupabaseClient | null = null

export function getPublicSupabaseClient() {
  const fallbackUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co'
  const fallbackKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  const hasRequiredEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!publicClient) {
    publicClient = createClient(fallbackUrl, fallbackKey, {
      global: {
        fetch: fetchViaPublicDns,
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  if (!hasRequiredEnv) {
    throw new Error('Supabase public client 环境变量缺失')
  }

  return publicClient
}

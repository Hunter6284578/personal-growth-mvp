import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const browserProxyUrl = typeof window === 'undefined'
  ? ''
  : `${window.location.origin}/api/supabase`
const fallbackUrl = browserProxyUrl || (supabaseUrl && supabaseUrl.length > 0 ? supabaseUrl : 'https://example.supabase.co')
const fallbackKey = supabaseAnonKey && supabaseAnonKey.length > 0 ? supabaseAnonKey : 'placeholder-anon-key'
const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : 'local'

export const supabase = createBrowserClient(fallbackUrl, fallbackKey, {
  auth: {
    storageKey: `sb-${projectRef}-auth-token`,
  },
})

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const fallbackUrl = supabaseUrl && supabaseUrl.length > 0 ? supabaseUrl : 'https://example.supabase.co'
const fallbackKey = supabaseAnonKey && supabaseAnonKey.length > 0 ? supabaseAnonKey : 'placeholder-anon-key'

export const supabase = createBrowserClient(fallbackUrl, fallbackKey)

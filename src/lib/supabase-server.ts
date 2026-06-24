import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { fetchViaPublicDns } from '@/lib/supabase-node-fetch'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchViaPublicDns,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Component 中调用 setAll 可能抛出异常，可以忽略
          }
        },
      },
    }
  )
}

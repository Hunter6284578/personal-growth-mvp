import type { User } from '@supabase/supabase-js'
import type { createClient } from '@/lib/supabase-server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function getConfiguredOwnerEmails() {
  return (process.env.SITE_OWNER_EMAIL || process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function isSiteAdmin(supabase: SupabaseServerClient, user: User | null) {
  if (!user) return false

  const ownerEmails = getConfiguredOwnerEmails()
  if (user.email && ownerEmails.includes(user.email.toLowerCase())) {
    return true
  }

  try {
    const { data, error } = await supabase
      .from('site_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) return false
    return Boolean(data)
  } catch {
    return false
  }
}

import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { Profile } from '@/types'

export async function getProfile(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  handleSupabaseError(error, { action: 'getProfile', userId })
  return data as Profile
}

export async function upsertProfile(profile: Partial<Profile>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'upsertProfile' })
  return data as Profile
}

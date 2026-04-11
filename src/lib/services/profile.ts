import { supabase } from '../supabase'
import type { Profile } from '@/types'

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function upsertProfile(profile: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}

import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { StatScore } from '@/types'

export async function getStatScores(userId: string, limit = 10) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getStatScores', userId })
  return (data ?? []) as StatScore[]
}

export async function getLatestStatScore(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    handleSupabaseError(error, { action: 'getLatestStatScore', userId })
  }
  return data as StatScore | null
}

export async function createStatScore(score: Partial<StatScore>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('stat_scores')
    .insert(score)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createStatScore' })
  return data as StatScore
}

import { supabase } from '../supabase'
import type { StatScore } from '@/types'

export async function getStatScores(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as StatScore[]
}

export async function getLatestStatScore(userId: string) {
  const { data, error } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as StatScore | null
}

export async function createStatScore(score: Partial<StatScore>) {
  const { data, error } = await supabase
    .from('stat_scores')
    .insert(score)
    .select()
    .single()
  
  if (error) throw error
  return data as StatScore
}

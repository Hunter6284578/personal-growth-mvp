import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { AIAnalysis } from '@/types'

export async function getAIAnalyses(userId: string, limit = 10) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getAIAnalyses', userId })
  return (data ?? []) as AIAnalysis[]
}

export async function createAIAnalysis(analysis: Partial<AIAnalysis>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert(analysis)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createAIAnalysis' })
  return data as AIAnalysis
}

import { supabase } from '../supabase'
import type { AIAnalysis } from '@/types'

export async function getAIAnalyses(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as AIAnalysis[]
}

export async function createAIAnalysis(analysis: Partial<AIAnalysis>) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert(analysis)
    .select()
    .single()
  
  if (error) throw error
  return data as AIAnalysis
}

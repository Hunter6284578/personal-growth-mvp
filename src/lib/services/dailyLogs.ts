import { supabase } from '../supabase'
import type { DailyLog } from '@/types'

export async function getDailyLogs(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as DailyLog[]
}

export async function getDailyLogByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as DailyLog | null
}

export async function upsertDailyLog(log: Partial<DailyLog>) {
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(log)
    .select()
    .single()
  
  if (error) throw error
  return data as DailyLog
}

export async function deleteDailyLog(id: string) {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

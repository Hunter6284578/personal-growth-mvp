import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { DailyLog } from '@/types'

export async function getDailyLogs(userId: string, limit = 30) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getDailyLogs', userId })
  return (data ?? []) as DailyLog[]
}

export async function getDailyLogByDate(userId: string, date: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    handleSupabaseError(error, { action: 'getDailyLogByDate', userId, date })
  }
  return data as DailyLog | null
}

export async function upsertDailyLog(log: Partial<DailyLog>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(log)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'upsertDailyLog' })
  return data as DailyLog
}

export async function deleteDailyLog(id: string, userId: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  handleSupabaseError(error, { action: 'deleteDailyLog', logId: id, userId })
}

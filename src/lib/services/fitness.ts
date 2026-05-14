import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { FitnessRecord, DailyHealth, FitnessTest, BodyMetrics } from '@/types'

// ==================== Fitness Records ====================

export async function getFitnessRecords(userId: string, limit = 50) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fitness_records')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getFitnessRecords', userId })
  return (data ?? []) as FitnessRecord[]
}

export async function createFitnessRecord(record: Partial<FitnessRecord>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fitness_records')
    .insert(record)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createFitnessRecord' })
  return data as FitnessRecord
}

export async function updateFitnessRecord(id: string, record: Partial<FitnessRecord>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fitness_records')
    .update(record)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateFitnessRecord', recordId: id })
  return data as FitnessRecord
}

export async function deleteFitnessRecord(id: string, userId: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('fitness_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  handleSupabaseError(error, { action: 'deleteFitnessRecord', recordId: id, userId })
}

// ==================== Daily Health ====================

export async function getDailyHealthRecords(userId: string, limit = 30) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('daily_health')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getDailyHealthRecords', userId })
  return (data ?? []) as DailyHealth[]
}

export async function getDailyHealthByDate(userId: string, date: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('daily_health')
    .select('*')
    .eq('user_id', userId)
    .eq('record_date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    handleSupabaseError(error, { action: 'getDailyHealthByDate', userId, date })
  }
  return data as DailyHealth | null
}

export async function upsertDailyHealth(record: Partial<DailyHealth>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('daily_health')
    .upsert(record, { onConflict: 'user_id,record_date' })
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'upsertDailyHealth' })
  return data as DailyHealth
}

export async function deleteDailyHealth(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('daily_health')
    .delete()
    .eq('id', id)
  
  handleSupabaseError(error, { action: 'deleteDailyHealth' })
}

// ==================== Fitness Tests ====================

export async function getFitnessTests(userId: string, limit = 20) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fitness_tests')
    .select('*')
    .eq('user_id', userId)
    .order('test_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getFitnessTests', userId })
  return (data ?? []) as FitnessTest[]
}

export async function createFitnessTest(test: Partial<FitnessTest>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fitness_tests')
    .insert(test)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createFitnessTest' })
  return data as FitnessTest
}

export async function updateFitnessTest(id: string, test: Partial<FitnessTest>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fitness_tests')
    .update(test)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateFitnessTest', testId: id })
  return data as FitnessTest
}

export async function deleteFitnessTest(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('fitness_tests')
    .delete()
    .eq('id', id)
  
  handleSupabaseError(error, { action: 'deleteFitnessTest', testId: id })
}

// ==================== Body Metrics ====================

export async function getBodyMetrics(userId: string, limit = 20) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getBodyMetrics', userId })
  return (data ?? []) as BodyMetrics[]
}

export async function createBodyMetrics(metrics: Partial<BodyMetrics>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('body_metrics')
    .insert(metrics)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createBodyMetrics' })
  return data as BodyMetrics
}

export async function updateBodyMetrics(id: string, metrics: Partial<BodyMetrics>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('body_metrics')
    .update(metrics)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateBodyMetrics', metricsId: id })
  return data as BodyMetrics
}

export async function deleteBodyMetrics(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('body_metrics')
    .delete()
    .eq('id', id)
  
  handleSupabaseError(error, { action: 'deleteBodyMetrics', metricsId: id })
}

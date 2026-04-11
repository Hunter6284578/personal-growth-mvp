import { supabase } from '../supabase'
import type { FitnessRecord, DailyHealth, FitnessTest, BodyMetrics } from '@/types'

// ==================== Fitness Records ====================

export async function getFitnessRecords(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('fitness_records')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as FitnessRecord[]
}

export async function createFitnessRecord(record: Partial<FitnessRecord>) {
  const { data, error } = await supabase
    .from('fitness_records')
    .insert(record)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessRecord
}

export async function updateFitnessRecord(id: string, record: Partial<FitnessRecord>) {
  const { data, error } = await supabase
    .from('fitness_records')
    .update(record)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessRecord
}

export async function deleteFitnessRecord(id: string) {
  const { error } = await supabase
    .from('fitness_records')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Daily Health ====================

export async function getDailyHealthRecords(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('daily_health')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as DailyHealth[]
}

export async function getDailyHealthByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_health')
    .select('*')
    .eq('user_id', userId)
    .eq('record_date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as DailyHealth | null
}

export async function upsertDailyHealth(record: Partial<DailyHealth>) {
  const { data, error } = await supabase
    .from('daily_health')
    .upsert(record, { onConflict: 'user_id,record_date' })
    .select()
    .single()
  
  if (error) throw error
  return data as DailyHealth
}

export async function deleteDailyHealth(id: string) {
  const { error } = await supabase
    .from('daily_health')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Fitness Tests ====================

export async function getFitnessTests(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('fitness_tests')
    .select('*')
    .eq('user_id', userId)
    .order('test_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as FitnessTest[]
}

export async function createFitnessTest(test: Partial<FitnessTest>) {
  const { data, error } = await supabase
    .from('fitness_tests')
    .insert(test)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessTest
}

export async function updateFitnessTest(id: string, test: Partial<FitnessTest>) {
  const { data, error } = await supabase
    .from('fitness_tests')
    .update(test)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessTest
}

export async function deleteFitnessTest(id: string) {
  const { error } = await supabase
    .from('fitness_tests')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Body Metrics ====================

export async function getBodyMetrics(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as BodyMetrics[]
}

export async function createBodyMetrics(metrics: Partial<BodyMetrics>) {
  const { data, error } = await supabase
    .from('body_metrics')
    .insert(metrics)
    .select()
    .single()
  
  if (error) throw error
  return data as BodyMetrics
}

export async function updateBodyMetrics(id: string, metrics: Partial<BodyMetrics>) {
  const { data, error } = await supabase
    .from('body_metrics')
    .update(metrics)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as BodyMetrics
}

export async function deleteBodyMetrics(id: string) {
  const { error } = await supabase
    .from('body_metrics')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

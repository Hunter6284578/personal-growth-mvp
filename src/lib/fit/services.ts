import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { FitExercise, FitLog, FitSet } from '@/types/fit'

// ==================== 动作库 ====================

export async function getExercises(): Promise<FitExercise[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fit_exercises')
    .select('*')
    .order('target_muscle', { ascending: true })

  handleSupabaseError(error, { action: 'getExercises' })
  return (data ?? []) as FitExercise[]
}

export async function getExercisesByMuscle(targetMuscle: string): Promise<FitExercise[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fit_exercises')
    .select('*')
    .eq('target_muscle', targetMuscle)
    .order('name', { ascending: true })

  handleSupabaseError(error, { action: 'getExercisesByMuscle', targetMuscle })
  return (data ?? []) as FitExercise[]
}

// ==================== 训练记录 ====================

export async function createFitLog(
  userId: string,
  date: string,
  exerciseId: string,
  sets: FitSet[],
  note?: string
): Promise<FitLog> {
  const supabase = getSupabaseClient()
  const totalVolume = sets.reduce((sum, s) => sum + s.volume, 0)
  const totalSets = sets.length

  const { data, error } = await supabase
    .from('fit_logs')
    .insert({
      user_id: userId,
      date,
      exercise_id: exerciseId,
      sets: sets as unknown as Record<string, unknown>[],
      total_volume: totalVolume,
      total_sets: totalSets,
      note: note || null,
    })
    .select()
    .single()

  handleSupabaseError(error, { action: 'createFitLog', userId, exerciseId })
  return data as FitLog
}

export async function getFitLogs(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<(FitLog & { exercise: FitExercise })[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('fit_logs')
    .select('*, exercise:fit_exercises(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error } = await query

  handleSupabaseError(error, { action: 'getFitLogs', userId })
  return (data ?? []) as (FitLog & { exercise: FitExercise })[]
}

export async function getFitLogDates(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fit_logs')
    .select('date')
    .eq('user_id', userId)

  handleSupabaseError(error, { action: 'getFitLogDates', userId })
  return [...new Set(((data ?? []) as { date: string }[]).map(d => d.date))].sort()
}

export async function getShoulderVolumeTrend(
  userId: string,
  days: number = 14
): Promise<{ date: string; volume: number }[]> {
  const supabase = getSupabaseClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startStr = startDate.toISOString().split('T')[0]

  // 获取肩部相关动作的 ID
  const shoulderExercises = await getExercisesByMuscle('三角肌中束')
  const shoulderIds = shoulderExercises.map(e => e.id)

  if (shoulderIds.length === 0) return []

  const { data, error } = await supabase
    .from('fit_logs')
    .select('date, total_volume')
    .eq('user_id', userId)
    .in('exercise_id', shoulderIds)
    .gte('date', startStr)
    .order('date', { ascending: true })

  handleSupabaseError(error, { action: 'getShoulderVolumeTrend', userId })

  // 按日期聚合
  const volumeByDate: Record<string, number> = {}
  for (const row of (data ?? []) as { date: string; total_volume: number }[]) {
    volumeByDate[row.date] = (volumeByDate[row.date] || 0) + row.total_volume
  }

  return Object.entries(volumeByDate).map(([date, volume]) => ({ date, volume }))
}

export async function deleteFitLog(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('fit_logs').delete().eq('id', id)
  handleSupabaseError(error, { action: 'deleteFitLog', logId: id })
}

// 批量创建训练记录（一次提交多个动作）
export async function createFitLogs(
  items: Array<{
    userId: string
    date: string
    exerciseId: string
    sets: FitSet[]
    note?: string
  }>
): Promise<FitLog[]> {
  const supabase = getSupabaseClient()
  const rows = items.map(item => {
    const totalVolume = item.sets.reduce((sum, s) => sum + s.volume, 0)
    return {
      user_id: item.userId,
      date: item.date,
      exercise_id: item.exerciseId,
      sets: item.sets as unknown as Record<string, unknown>[],
      total_volume: totalVolume,
      total_sets: item.sets.length,
      note: item.note || null,
    }
  })

  const { data, error } = await supabase
    .from('fit_logs')
    .insert(rows)
    .select()

  handleSupabaseError(error, { action: 'createFitLogs', count: items.length })
  return (data ?? []) as FitLog[]
}

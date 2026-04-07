import type { FitSet } from '@/types/fit'

const OFFLINE_KEY = 'fit_offline_logs'

interface OfflineLog {
  id: string
  timestamp: number
  date: string
  exercise_id: string
  exercise_name: string
  sets: FitSet[]
  total_volume: number
  total_sets: number
  note?: string
}

// 保存到离线缓存
export function saveOfflineLog(log: OfflineLog): void {
  const logs = getOfflineLogs()
  logs.push(log)
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(logs))
}

// 获取所有待同步的离线记录
export function getOfflineLogs(): OfflineLog[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(OFFLINE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 移除已同步的记录
export function removeOfflineLog(id: string): void {
  const logs = getOfflineLogs().filter(l => l.id !== id)
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(logs))
}

// 清空所有离线记录
export function clearOfflineLogs(): void {
  localStorage.removeItem(OFFLINE_KEY)
}

// 检查是否有待同步记录
export function hasPendingLogs(): boolean {
  return getOfflineLogs().length > 0
}

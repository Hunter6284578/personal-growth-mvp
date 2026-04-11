'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getExercises, createFitLogs, createFitLog } from '@/lib/fit/services'
import { saveOfflineLog, getOfflineLogs, removeOfflineLog } from '@/lib/fit/offline'
import { useAuth } from '@/hooks/useAuth'
import type { FitExercise, FitSet } from '@/types/fit'
import {
  Plus, Trash2, Save, WifiOff, Wifi, RefreshCw,
  Dumbbell, ChevronDown, ChevronUp, GripVertical,
  AlertCircle, CheckCircle2, X
} from 'lucide-react'

interface ExerciseEntry {
  id: string
  exercise: FitExercise | null
  sets: FitSet[]
  showPicker: boolean
  search: string
  errors: string[]
}

function createDefaultEntry(): ExerciseEntry {
  return {
    id: crypto.randomUUID(),
    exercise: null,
    sets: [{ set_index: 1, weight: 0, reps: 0, rir: 2, volume: 0 }],
    showPicker: false,
    search: '',
    errors: [],
  }
}

function reindexSets(sets: FitSet[]): FitSet[] {
  return sets.map((s, i) => ({ ...s, set_index: i + 1 }))
}

export default function FitLogsPage() {
  const { user } = useAuth()
  const [allExercises, setAllExercises] = useState<FitExercise[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [entries, setEntries] = useState<ExerciseEntry[]>([createDefaultEntry()])
  const [saving, setSaving] = useState(false)
  const [showOffline, setShowOffline] = useState(false)
  const [offlineLogs, setOfflineLogs] = useState<ReturnType<typeof getOfflineLogs>>([])
  const [syncing, setSyncing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadExercises()
    loadOfflineLogs()
  }, [])

  const loadExercises = async () => {
    try {
      const data = await getExercises()
      setAllExercises(data)
    } catch (error) {
      console.error('加载动作库失败:', error)
    }
  }

  const loadOfflineLogs = () => {
    setOfflineLogs(getOfflineLogs())
  }

  // ==================== 动作选择 ====================

  const selectExercise = (entryId: string, exercise: FitExercise) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e
      return { ...e, exercise, showPicker: false, search: '', errors: e.errors.filter(err => !err.includes('动作')) }
    }))
  }

  const removeExerciseEntry = (entryId: string) => {
    if (entries.length <= 1) return
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  const addExerciseEntry = () => {
    setEntries(prev => [...prev, createDefaultEntry()])
  }

  // ==================== 组数操作 ====================

  const addSet = (entryId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e
      return { ...e, sets: reindexSets([...e.sets, { set_index: e.sets.length + 1, weight: 0, reps: 0, rir: 2, volume: 0 }]) }
    }))
  }

  const removeSet = (entryId: string, setIndex: number) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e
      if (e.sets.length <= 1) return e
      return { ...e, sets: reindexSets(e.sets.filter((_, i) => i !== setIndex)) }
    }))
  }

  const updateSet = (entryId: string, setIndex: number, field: keyof FitSet, value: number) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e
      const newSets = e.sets.map((s, i) => {
        if (i !== setIndex) return s
        const updated = { ...s, [field]: value }
        updated.volume = updated.weight * updated.reps
        return updated
      })
      return { ...e, sets: newSets }
    }))
  }

  // ==================== 表单验证 ====================

  const validateEntries = (): boolean => {
    let valid = true
    const updated = entries.map(e => {
      const errs: string[] = []
      if (!e.exercise) errs.push('请选择动作')
      const hasValidSet = e.sets.some(s => s.weight > 0 && s.reps > 0)
      if (!hasValidSet) errs.push('至少一组需填写重量和次数')
      if (errs.length > 0) valid = false
      return { ...e, errors: errs }
    })
    setEntries(updated)
    return valid
  }

  // ==================== 保存 ====================

  const handleSave = async () => {
    if (!user) return
    if (!validateEntries()) return

    const validEntries = entries.filter(e => e.exercise)

    if (!navigator.onLine) {
      for (const entry of validEntries) {
        saveOfflineLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          date,
          exercise_id: entry.exercise!.id,
          exercise_name: entry.exercise!.name,
          sets: entry.sets,
          total_volume: entry.sets.reduce((s, set) => s + set.volume, 0),
          total_sets: entry.sets.length,
          note: note || undefined,
        })
      }
      loadOfflineLogs()
      setShowOffline(true)
      setSaveMessage({ type: 'error', text: '网络不可用，已保存到本地缓存' })
      return
    }

    setSaving(true)
    setSaveMessage(null)
    try {
      await createFitLogs(
        validEntries.map(e => ({
          userId: user.id,
          date,
          exerciseId: e.exercise!.id,
          sets: e.sets,
          note: note || undefined,
        }))
      )
      setSaveMessage({ type: 'success', text: `成功保存 ${validEntries.length} 个动作记录` })
      setEntries([createDefaultEntry()])
      setNote('')
    } catch (error) {
      console.error('保存失败:', error)
      for (const entry of validEntries) {
        saveOfflineLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          date,
          exercise_id: entry.exercise!.id,
          exercise_name: entry.exercise!.name,
          sets: entry.sets,
          total_volume: entry.sets.reduce((s, set) => s + set.volume, 0),
          total_sets: entry.sets.length,
          note: note || undefined,
        })
      }
      loadOfflineLogs()
      setShowOffline(true)
      setSaveMessage({ type: 'error', text: '保存失败，已缓存到本地' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 4000)
    }
  }

  const handleSync = async () => {
    if (!user) return
    setSyncing(true)
    let synced = 0
    let failed = 0

    for (const log of offlineLogs) {
      try {
        await createFitLog(user.id, log.date, log.exercise_id, log.sets, log.note)
        removeOfflineLog(log.id)
        synced++
      } catch {
        failed++
      }
    }

    loadOfflineLogs()
    setSyncing(false)
    alert(`同步完成：成功 ${synced} 条${failed > 0 ? `，失败 ${failed} 条` : ''}`)
  }

  const filteredExercises = (entry: ExerciseEntry) =>
    allExercises.filter(e =>
      e.name.includes(entry.search) ||
      e.target_muscle.includes(entry.search) ||
      (e.equipment && e.equipment.includes(entry.search))
    )

  const grandTotal = entries.reduce((sum, e) => sum + e.sets.reduce((s, set) => s + set.volume, 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>训练记录</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>支持一次添加多个动作，批量提交训练数据</p>
        </div>
        <div className="flex items-center gap-2">
          {navigator.onLine ? (
            <span className="flex items-center text-green-400 text-sm"><Wifi className="w-4 h-4 mr-1" />在线</span>
          ) : (
            <span className="flex items-center text-red-400 text-sm"><WifiOff className="w-4 h-4 mr-1" />离线</span>
          )}
        </div>
      </div>

      {/* 离线缓存提示 */}
      {offlineLogs.length > 0 && (
        <div className="p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-300 text-sm">
                {offlineLogs.length} 条记录待同步
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOffline(!showOffline)}
              >
                {showOffline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              {navigator.onLine && (
                <Button variant="primary" size="sm" onClick={handleSync} loading={syncing}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  同步
                </Button>
              )}
            </div>
          </div>
          {showOffline && (
            <div className="mt-3 space-y-2">
              {offlineLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between text-sm p-2 rounded" style={{ background: 'var(--dash-card-soft)' }}>
                  <div>
                    <span style={{ color: 'var(--text-bright)' }}>{log.exercise_name}</span>
                    <span className="ml-2" style={{ color: 'var(--text-dim)' }}>{log.date}</span>
                  </div>
                  <span style={{ color: 'var(--text-dim)' }}>{log.total_sets}组 {log.total_volume}kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 日期 + 全局备注 */}
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-bright)' }}>训练日期</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-bright)' }}>整体备注</label>
            <Textarea
              placeholder="今天的训练感受、调整计划等..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* 动作列表 */}
      <div className="space-y-4">
        {entries.map((entry, entryIndex) => (
          <Card key={entry.id}>
            {/* 动作标题栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--dash-card-soft)', color: 'var(--text-muted)' }}>
                  动作 {entryIndex + 1}
                </span>
              </div>
              {entries.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeExerciseEntry(entry.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  移除
                </Button>
              )}
            </div>

            {/* 错误提示 */}
            {entry.errors.length > 0 && (
              <div className="mb-3 p-2 bg-red-900/20 border border-red-700/40 rounded-lg text-xs space-y-1">
                {entry.errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1" style={{ color: '#c49090' }}>
                    <AlertCircle className="w-3 h-3" />
                    {err}
                  </div>
                ))}
              </div>
            )}

            {/* 动作选择器 */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setEntries(prev => prev.map(e =>
                    e.id === entry.id ? { ...e, showPicker: !e.showPicker, search: '' } : e
                  ))
                }}
                className="w-full px-3 py-2.5 rounded-lg text-left transition-colors flex items-center justify-between"
                style={{
                  background: entry.exercise ? 'rgba(88, 132, 204, 0.08)' : 'var(--dash-input-bg)',
                  border: entry.exercise
                    ? '1px solid rgba(88, 132, 204, 0.3)'
                    : '1px solid var(--dash-border)',
                }}
              >
                {entry.exercise ? (
                  <span className="flex items-center">
                    <Dumbbell className="w-4 h-4 mr-2" style={{ color: '#5884cc' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-bright)' }}>{entry.exercise.name}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-dim)' }}>{entry.exercise.target_muscle}</span>
                  </span>
                ) : (
                  <span className="text-sm" style={{ color: 'var(--text-dim)' }}>点击选择动作...</span>
                )}
                {entry.exercise && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEntries(prev => prev.map(en =>
                        en.id === entry.id ? { ...en, exercise: null } : en
                      ))
                    }}
                    className="p-0.5 rounded hover:bg-red-900/30"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </button>

              {entry.showPicker && (
                <div className="mt-2 border rounded-lg overflow-hidden" style={{ borderColor: 'var(--dash-border)', background: 'var(--dash-card-soft)' }}>
                  <div className="p-2" style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <Input
                      placeholder="搜索动作名称、肌群、器械..."
                      value={entry.search}
                      onChange={(e) => setEntries(prev => prev.map(en =>
                        en.id === entry.id ? { ...en, search: e.target.value } : en
                      ))}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredExercises(entry).map(exercise => (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => selectExercise(entry.id, exercise)}
                        className="w-full px-3 py-2 text-left transition-colors flex items-center justify-between hover:bg-black/10"
                        style={{ color: 'var(--text)' }}
                      >
                        <div>
                          <span className="text-sm" style={{ color: 'var(--text-bright)' }}>{exercise.name}</span>
                          <span className="text-xs ml-2" style={{ color: 'var(--text-dim)' }}>{exercise.target_muscle}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                          {exercise.equipment || '自重'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 组数输入 */}
            {entry.exercise && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>组数设置</span>
                  <Button variant="ghost" size="sm" onClick={() => addSet(entry.id)}>
                    <Plus className="w-3.5 h-3.5 mr-1" />添加组
                  </Button>
                </div>

                {/* 表头 */}
                <div className="grid grid-cols-6 gap-2 text-xs px-1 mb-1" style={{ color: 'var(--text-dim)' }}>
                  <span className="text-center">组次</span>
                  <span className="text-center">重量(kg)</span>
                  <span className="text-center">次数</span>
                  <span className="text-center">RIR</span>
                  <span className="text-center">容量</span>
                  <span />
                </div>

                {entry.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-6 gap-2 items-center mb-1.5 relative">
                    <span className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>{set.set_index}</span>
                    <Input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(entry.id, setIndex, 'weight', Number(e.target.value))}
                      placeholder="0"
                      className="text-center text-sm"
                    />
                    <Input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(entry.id, setIndex, 'reps', Number(e.target.value))}
                      placeholder="0"
                      className="text-center text-sm"
                    />
                    <Input
                      type="number"
                      value={set.rir}
                      onChange={(e) => updateSet(entry.id, setIndex, 'rir', Number(e.target.value))}
                      placeholder="2"
                      className="text-center text-sm"
                    />
                    <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      {set.volume > 0 ? set.volume : '-'}
                    </div>
                    {entry.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(entry.id, setIndex)}
                        className="p-0.5 rounded hover:bg-red-900/30"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 mt-2" style={{ borderTop: '1px solid var(--dash-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    小计: {entry.sets.reduce((s, set) => s + set.volume, 0)} kg / {entry.sets.length} 组
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 添加动作按钮 */}
      <Button variant="outline" onClick={addExerciseEntry} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        添加动作
      </Button>

      {/* 保存状态 + 提交 */}
      {saveMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            saveMessage.type === 'success' ? 'bg-green-900/20 border border-green-700/40' : 'bg-red-900/20 border border-red-700/40'
          }`}
        >
          {saveMessage.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-green-400" />
            : <AlertCircle className="w-4 h-4 text-red-400" />
          }
          <span style={{ color: saveMessage.type === 'success' ? '#90c490' : '#c49090' }}>{saveMessage.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          共 {entries.length} 个动作 / 总容量 {grandTotal} kg
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !entries.some(e => e.exercise)}
          loading={saving}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          批量保存
        </Button>
      </div>
    </div>
  )
}

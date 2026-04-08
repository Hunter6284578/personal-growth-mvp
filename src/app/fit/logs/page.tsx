'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getExercises, createFitLog } from '@/lib/fit/services'
import { saveOfflineLog, getOfflineLogs, removeOfflineLog } from '@/lib/fit/offline'
import { useAuth } from '@/hooks/useAuth'
import type { FitExercise, FitSet } from '@/types/fit'
import {
  Plus, Trash2, Save, WifiOff, Wifi, RefreshCw,
  Dumbbell, ChevronDown, ChevronUp
} from 'lucide-react'

export default function FitLogsPage() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<FitExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<FitExercise | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [sets, setSets] = useState<FitSet[]>([
    { set_index: 1, weight: 0, reps: 0, rir: 2, volume: 0 },
  ])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showExerciseList, setShowExerciseList] = useState(false)
  const [showOffline, setShowOffline] = useState(false)
  const [offlineLogs, setOfflineLogs] = useState<ReturnType<typeof getOfflineLogs>>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadExercises()
    loadOfflineLogs()
  }, [])

  const loadExercises = async () => {
    try {
      const data = await getExercises()
      setExercises(data)
    } catch (error) {
      console.error('加载动作库失败:', error)
    }
  }

  const loadOfflineLogs = () => {
    setOfflineLogs(getOfflineLogs())
  }

  const filteredExercises = exercises.filter(e =>
    e.name.includes(search) ||
    e.target_muscle.includes(search) ||
    (e.equipment && e.equipment.includes(search))
  )

  const addSet = () => {
    const nextIndex = sets.length + 1
    setSets([...sets, { set_index: nextIndex, weight: 0, reps: 0, rir: 2, volume: 0 }])
  }

  const removeSet = (index: number) => {
    if (sets.length <= 1) return
    setSets(sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, set_index: i + 1 })))
  }

  const updateSet = (index: number, field: keyof FitSet, value: number) => {
    const updated = sets.map((s, i) => {
      if (i !== index) return s
      const newSet = { ...s, [field]: value }
      newSet.volume = newSet.weight * newSet.reps
      return newSet
    })
    setSets(updated)
  }

  const totalVolume = sets.reduce((sum, s) => sum + s.volume, 0)

  const handleSave = async () => {
    if (!selectedExercise || !user) return

    // 检查网络状态
    if (!navigator.onLine) {
      saveOfflineLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        date,
        exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.name,
        sets,
        total_volume: totalVolume,
        total_sets: sets.length,
        note: note || undefined,
      })
      loadOfflineLogs()
      setShowOffline(true)
      alert('网络不可用，已保存到本地缓存，恢复网络后请同步')
      return
    }

    setSaving(true)
    try {
      await createFitLog(user.id, date, selectedExercise.id, sets, note)
      alert('保存成功！')
      setSets([{ set_index: 1, weight: 0, reps: 0, rir: 2, volume: 0 }])
      setNote('')
      setSelectedExercise(null)
    } catch (error) {
      console.error('保存失败:', error)
      // 保存到离线缓存
      saveOfflineLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        date,
        exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.name,
        sets,
        total_volume: totalVolume,
        total_sets: sets.length,
        note: note || undefined,
      })
      loadOfflineLogs()
      setShowOffline(true)
      alert('保存失败，已缓存到本地，恢复网络后请同步')
    } finally {
      setSaving(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">训练记录</h1>
          <p className="text-gray-400 text-sm mt-1">记录每次训练的组数、重量和强度</p>
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
                <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-gray-800 rounded">
                  <div>
                    <span className="text-gray-300">{log.exercise_name}</span>
                    <span className="text-gray-500 ml-2">{log.date}</span>
                  </div>
                  <span className="text-gray-500">{log.total_sets}组 {log.total_volume}kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧：动作选择 + 组数录入 */}
        <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">日期</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* 动作选择器 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">选择动作</label>
                <button
                  type="button"
                  onClick={() => setShowExerciseList(!showExerciseList)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-left text-white hover:border-gray-500 transition-colors"
                >
                  {selectedExercise ? (
                    <span className="flex items-center">
                      <Dumbbell className="w-4 h-4 mr-2 text-blue-400" />
                      {selectedExercise.name}
                      <span className="text-gray-500 text-sm ml-2">{selectedExercise.target_muscle}</span>
                    </span>
                  ) : (
                    <span className="text-gray-500">点击选择动作...</span>
                  )}
                </button>

                {showExerciseList && (
                  <div className="mt-2 border border-gray-600 rounded-lg overflow-hidden bg-gray-800">
                    <div className="p-2 border-b border-gray-700">
                      <Input
                        placeholder="搜索动作名称、肌群、器械..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredExercises.map(exercise => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => {
                            setSelectedExercise(exercise)
                            setShowExerciseList(false)
                            setSearch('')
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="text-white text-sm">{exercise.name}</span>
                            <span className="text-gray-500 text-xs ml-2">{exercise.target_muscle}</span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {exercise.equipment || '自重'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：组数详情 */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">训练组数</span>
              <Button variant="ghost" size="sm" onClick={addSet}>
                <Plus className="w-4 h-4 mr-1" />添加组
              </Button>
            </div>

            {/* 表头 */}
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 px-1">
              <span>组次</span>
              <span>重量(kg)</span>
              <span>次数</span>
              <span>RIR</span>
              <span>容量</span>
            </div>

            {sets.map((set, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 items-center">
                <span className="text-center text-sm text-gray-400">{set.set_index}</span>
                <Input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => updateSet(index, 'weight', Number(e.target.value))}
                  placeholder="0"
                  className="text-center text-sm"
                />
                <Input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(index, 'reps', Number(e.target.value))}
                  placeholder="0"
                  className="text-center text-sm"
                />
                <Input
                  type="number"
                  value={set.rir}
                  onChange={(e) => updateSet(index, 'rir', Number(e.target.value))}
                  placeholder="2"
                  className="text-center text-sm"
                />
                <div className="text-center text-sm text-gray-400">
                  {set.volume > 0 ? set.volume : '-'}
                </div>
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(index)}
                    className="absolute right-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-400">总容量</span>
              <span className="text-lg font-bold text-white">{totalVolume} kg</span>
            </div>

            <Textarea
              placeholder="训练备注（可选）..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />

            <Button
              onClick={handleSave}
              disabled={!selectedExercise}
              loading={saving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              保存记录
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

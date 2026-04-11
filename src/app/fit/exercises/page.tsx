'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { getExercises } from '@/lib/fit/services'
import { MUSCLE_GROUPS, CATEGORY_LABELS, EQUIPMENT_LABELS } from '@/types/fit'
import type { FitExercise } from '@/types/fit'
import { Search, Dumbbell } from 'lucide-react'

export default function FitExercisesPage() {
  const [exercises, setExercises] = useState<FitExercise[]>([])
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const data = await getExercises()
      setExercises(data)
    } catch (error) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error)
      console.error('加载动作库失败:', msg)
      setLoadError(msg)
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(e => {
    const matchSearch = !search ||
      e.name.includes(search) ||
      e.target_muscle.includes(search) ||
      (e.equipment && e.equipment.includes(search))
    const matchMuscle = !filterMuscle || e.target_muscle === filterMuscle
    return matchSearch && matchMuscle
  })

  // 按肌群分组
  const grouped = filteredExercises.reduce<Record<string, FitExercise[]>>((acc, e) => {
    const key = e.target_muscle
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg max-w-lg text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>动作库加载失败</p>
          <p className="text-xs mt-1 break-all" style={{ color: 'var(--text-dim)' }}>{loadError}</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>请确认 Supabase 环境变量已配置且 fit_exercises 表已创建</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>动作库</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>所有可用训练动作，按肌群分类</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="搜索动作名称、肌群、器械..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pg-input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterMuscle(null)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: !filterMuscle ? 'var(--accent)' : 'var(--dash-card-soft)',
                color: !filterMuscle ? 'var(--bg)' : 'var(--text-muted)',
                border: `1px solid ${!filterMuscle ? 'var(--accent)' : 'var(--dash-border)'}`,
              }}
            >
              全部
            </button>
            {[...MUSCLE_GROUPS].map(muscle => (
              <button
                key={muscle}
                onClick={() => setFilterMuscle(filterMuscle === muscle ? null : muscle)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: filterMuscle === muscle ? 'var(--accent)' : 'var(--dash-card-soft)',
                  color: filterMuscle === muscle ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${filterMuscle === muscle ? 'var(--accent)' : 'var(--dash-border)'}`,
                }}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 动作列表 */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([muscle, items]) => (
          <div key={muscle}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-bright)' }}>{muscle}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(exercise => (
                <button
                  type="button"
                  key={exercise.id}
                  onClick={() => setSelectedId(selectedId === exercise.id ? null : exercise.id)}
                  className="p-4 rounded-lg transition-all text-left cursor-pointer"
                  style={{
                    background: selectedId === exercise.id ? 'rgba(88, 132, 204, 0.12)' : 'var(--dash-card)',
                    border: selectedId === exercise.id ? '2px solid #5884cc' : '1px solid var(--dash-border)',
                    transform: selectedId === exercise.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={e => {
                    if (selectedId !== exercise.id) {
                      e.currentTarget.style.borderColor = 'var(--text-muted)'
                      e.currentTarget.style.background = 'var(--dash-card-soft)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedId !== exercise.id) {
                      e.currentTarget.style.borderColor = 'var(--dash-border)'
                      e.currentTarget.style.background = 'var(--dash-card)'
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ background: selectedId === exercise.id ? 'rgba(88, 132, 204, 0.2)' : 'var(--dash-card-soft)' }}>
                      <Dumbbell className="w-4 h-4" style={{ color: selectedId === exercise.id ? '#5884cc' : 'var(--text-dim)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm" style={{ color: 'var(--text-bright)' }}>{exercise.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--dash-card-soft)', color: 'var(--text-muted)' }}>
                          {CATEGORY_LABELS[exercise.category] || exercise.category}
                        </span>
                        {exercise.equipment && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--dash-card-soft)', color: 'var(--text-muted)' }}>
                            {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>{exercise.notes}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-dim)' }}>
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>未找到匹配的动作</p>
        </div>
      )}
    </div>
  )
}

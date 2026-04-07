'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getExercises } from '@/lib/fit/services'
import { MUSCLE_GROUPS, CATEGORY_LABELS, EQUIPMENT_LABELS } from '@/types/fit'
import type { FitExercise } from '@/types/fit'
import { Search, Dumbbell, Filter } from 'lucide-react'

export default function FitExercisesPage() {
  const [exercises, setExercises] = useState<FitExercise[]>([])
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const data = await getExercises()
      setExercises(data)
    } catch (error) {
      console.error('加载动作库失败:', error)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">动作库</h1>
        <p className="text-gray-400 text-sm mt-1">所有可用训练动作，按肌群分类</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索动作名称、肌群、器械..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterMuscle(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !filterMuscle
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              全部
            </button>
            {[...MUSCLE_GROUPS].map(muscle => (
              <button
                key={muscle}
                onClick={() => setFilterMuscle(filterMuscle === muscle ? null : muscle)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterMuscle === muscle
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
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
            <h2 className="text-lg font-semibold text-white mb-3">{muscle}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(exercise => (
                <div
                  key={exercise.id}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <Dumbbell className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                          {CATEGORY_LABELS[exercise.category] || exercise.category}
                        </span>
                        {exercise.equipment && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                            {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-gray-500 mt-2">{exercise.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>未找到匹配的动作</p>
        </div>
      )}
    </div>
  )
}

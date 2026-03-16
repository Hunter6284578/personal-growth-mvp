'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Activity, Trash2, Edit2, X } from 'lucide-react'
import { getFitnessRecords, createFitnessRecord, updateFitnessRecord, deleteFitnessRecord } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { FitnessRecord } from '@/types'

export default function FitnessPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<FitnessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // 表单状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [run1000m, setRun1000m] = useState('')
  const [pullUps, setPullUps] = useState('')
  const [pushUps, setPushUps] = useState('')
  const [restingHr, setRestingHr] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [note, setNote] = useState('')

  // 加载数据
  useEffect(() => {
    if (user) {
      loadRecords()
    }
  }, [user])

  const loadRecords = async () => {
    if (!user) return
    try {
      const data = await getFitnessRecords(user.id, 50)
      setRecords(data)
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setRecordDate(new Date().toISOString().split('T')[0])
    setWeight('')
    setBodyFat('')
    setRun1000m('')
    setPullUps('')
    setPushUps('')
    setRestingHr('')
    setSleepHours('')
    setNote('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const recordData = {
        user_id: user.id,
        record_date: recordDate,
        weight: weight ? parseFloat(weight) : null,
        body_fat: bodyFat ? parseFloat(bodyFat) : null,
        run_1000m_seconds: run1000m ? parseInt(run1000m) : null,
        pull_ups: pullUps ? parseInt(pullUps) : null,
        push_ups: pushUps ? parseInt(pushUps) : null,
        resting_hr: restingHr ? parseInt(restingHr) : null,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        note: note || null,
      }

      if (editingId) {
        await updateFitnessRecord(editingId, recordData)
      } else {
        await createFitnessRecord(recordData)
      }

      await loadRecords()
      resetForm()
      setShowForm(false)
      alert(editingId ? '更新成功！' : '保存成功！')
    } catch (error) {
      console.error('Error saving record:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      await deleteFitnessRecord(id)
      await loadRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('删除失败')
    }
  }

  const handleEdit = (record: FitnessRecord) => {
    setEditingId(record.id)
    setRecordDate(record.record_date)
    setWeight(record.weight?.toString() || '')
    setBodyFat(record.body_fat?.toString() || '')
    setRun1000m(record.run_1000m_seconds?.toString() || '')
    setPullUps(record.pull_ups?.toString() || '')
    setPushUps(record.push_ups?.toString() || '')
    setRestingHr(record.resting_hr?.toString() || '')
    setSleepHours(record.sleep_hours?.toString() || '')
    setNote(record.note || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 获取最新记录
  const latestRecord = records[0]

  // 格式化时间（秒转分:秒）
  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">体测数据</h1>
          <p className="text-gray-400 mt-1">追踪身体健康指标</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? '取消' : '添加记录'}
        </Button>
      </div>

      {/* 最新数据概览 */}
      {latestRecord && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">体重</p>
            <p className="text-xl font-bold text-white">
              {latestRecord.weight || '-'} <span className="text-sm font-normal text-gray-500">kg</span>
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">体脂率</p>
            <p className="text-xl font-bold text-white">
              {latestRecord.body_fat || '-'} <span className="text-sm font-normal text-gray-500">%</span>
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <Activity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">1000米跑</p>
            <p className="text-xl font-bold text-white">{formatTime(latestRecord.run_1000m_seconds)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">静息心率</p>
            <p className="text-xl font-bold text-white">
              {latestRecord.resting_hr || '-'} <span className="text-sm font-normal text-gray-500">bpm</span>
            </p>
          </div>
        </div>
      )}

      {/* 添加/编辑表单 */}
      {showForm && (
        <Card title={editingId ? '编辑记录' : '添加体测记录'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">日期 *</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70.5"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">体脂率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="18.5"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">1000米跑 (秒)</label>
                <input
                  type="number"
                  value={run1000m}
                  onChange={(e) => setRun1000m(e.target.value)}
                  placeholder="240"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">引体向上 (个)</label>
                <input
                  type="number"
                  value={pullUps}
                  onChange={(e) => setPullUps(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">俯卧撑 (个)</label>
                <input
                  type="number"
                  value={pushUps}
                  onChange={(e) => setPushUps(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">静息心率 (bpm)</label>
                <input
                  type="number"
                  value={restingHr}
                  onChange={(e) => setRestingHr(e.target.value)}
                  placeholder="65"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">睡眠时长 (小时)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="7.5"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">备注</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录测量时的特殊情况..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {editingId ? '更新' : '保存'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消编辑
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* 历史记录 */}
      <Card title="历史记录" subtitle={`共 ${records.length} 条记录`}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无记录</div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{record.record_date}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                  {record.weight && <span>体重: {record.weight}kg</span>}
                  {record.body_fat && <span>体脂: {record.body_fat}%</span>}
                  {record.run_1000m_seconds && <span>1000m: {formatTime(record.run_1000m_seconds)}</span>}
                  {record.resting_hr && <span>心率: {record.resting_hr}bpm</span>}
                </div>
                {record.note && (
                  <p className="text-gray-500 text-sm mt-2">{record.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

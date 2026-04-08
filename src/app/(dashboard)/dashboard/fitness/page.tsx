'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Activity, Trash2, Edit2, X, Moon, Heart, Dumbbell } from 'lucide-react'
import { 
  getDailyHealthRecords, 
  upsertDailyHealth, 
  deleteDailyHealth,
  getFitnessTests,
  createFitnessTest,
  updateFitnessTest,
  deleteFitnessTest,
  getBodyMetrics,
  createBodyMetrics,
  updateBodyMetrics,
  deleteBodyMetrics
} from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { DailyHealth, FitnessTest, BodyMetrics } from '@/types'

export default function FitnessPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'daily' | 'test' | 'metrics'>('daily')
  
  // ================= 状态定义 =================
  // 每日健康状态
  const [dailyRecords, setDailyRecords] = useState<DailyHealth[]>([])
  const [dailyForm, setDailyForm] = useState({
    record_date: new Date().toISOString().split('T')[0],
    sleep_hours: '',
    sleep_quality: '',
    weight: '',
    exercise_type: '',
    exercise_minutes: '',
    note: ''
  })

  // 体测成绩状态
  const [testRecords, setTestRecords] = useState<FitnessTest[]>([])
  const [testForm, setTestForm] = useState({
    id: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'school_test' as 'school_test' | 'self_test',
    semester: '',
    run_1000m_seconds: '',
    pull_ups: '',
    standing_jump: '',
    sit_and_reach: '',
    vital_capacity: '',
    total_score: '',
    note: ''
  })

  // 身体数据状态
  const [metricsRecords, setMetricsRecords] = useState<BodyMetrics[]>([])
  const [metricsForm, setMetricsForm] = useState({
    id: '',
    record_date: new Date().toISOString().split('T')[0],
    body_fat: '',
    resting_hr: '',
    chest: '',
    waist: '',
    hip: '',
    note: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const loadAllRecords = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [daily, tests, metrics] = await Promise.all([
        getDailyHealthRecords(user.id, 30),
        getFitnessTests(user.id, 20),
        getBodyMetrics(user.id, 20)
      ])
      setDailyRecords(daily)
      setTestRecords(tests)
      setMetricsRecords(metrics)
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // ================= 数据加载 =================
  useEffect(() => {
    if (user) {
      void loadAllRecords()
    }
  }, [user, loadAllRecords])

  const resetForm = () => {
    if (activeTab === 'daily') {
      setDailyForm({
        record_date: new Date().toISOString().split('T')[0],
        sleep_hours: '',
        sleep_quality: '',
        weight: '',
        exercise_type: '',
        exercise_minutes: '',
        note: ''
      })
    } else if (activeTab === 'test') {
      setTestForm({
        id: '',
        test_date: new Date().toISOString().split('T')[0],
        test_type: 'school_test',
        semester: '',
        run_1000m_seconds: '',
        pull_ups: '',
        standing_jump: '',
        sit_and_reach: '',
        vital_capacity: '',
        total_score: '',
        note: ''
      })
    } else {
      setMetricsForm({
        id: '',
        record_date: new Date().toISOString().split('T')[0],
        body_fat: '',
        resting_hr: '',
        chest: '',
        waist: '',
        hip: '',
        note: ''
      })
    }
  }

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await upsertDailyHealth({
        user_id: user.id,
        record_date: dailyForm.record_date,
        sleep_hours: dailyForm.sleep_hours ? parseFloat(dailyForm.sleep_hours) : null,
        sleep_quality: dailyForm.sleep_quality ? parseInt(dailyForm.sleep_quality) : null,
        weight: dailyForm.weight ? parseFloat(dailyForm.weight) : null,
        exercise_type: dailyForm.exercise_type || null,
        exercise_minutes: dailyForm.exercise_minutes ? parseInt(dailyForm.exercise_minutes) : null,
        note: dailyForm.note || null,
      })

      await loadAllRecords()
      resetForm()
      setShowForm(false)
      alert('每日健康记录保存成功！')
    } catch (error) {
      console.error('Error saving daily health:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const recordData = {
        user_id: user.id,
        test_date: testForm.test_date,
        test_type: testForm.test_type,
        semester: testForm.semester || null,
        run_1000m_seconds: testForm.run_1000m_seconds ? parseInt(testForm.run_1000m_seconds) : null,
        pull_ups: testForm.pull_ups ? parseInt(testForm.pull_ups) : null,
        standing_jump: testForm.standing_jump ? parseInt(testForm.standing_jump) : null,
        sit_and_reach: testForm.sit_and_reach ? parseFloat(testForm.sit_and_reach) : null,
        vital_capacity: testForm.vital_capacity ? parseInt(testForm.vital_capacity) : null,
        total_score: testForm.total_score ? parseFloat(testForm.total_score) : null,
        note: testForm.note || null,
      }

      if (testForm.id) {
        await updateFitnessTest(testForm.id, recordData)
      } else {
        await createFitnessTest(recordData)
      }

      await loadAllRecords()
      resetForm()
      setShowForm(false)
      alert('体测成绩保存成功！')
    } catch (error) {
      console.error('Error saving fitness test:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleMetricsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const recordData = {
        user_id: user.id,
        record_date: metricsForm.record_date,
        body_fat: metricsForm.body_fat ? parseFloat(metricsForm.body_fat) : null,
        resting_hr: metricsForm.resting_hr ? parseInt(metricsForm.resting_hr) : null,
        chest: metricsForm.chest ? parseFloat(metricsForm.chest) : null,
        waist: metricsForm.waist ? parseFloat(metricsForm.waist) : null,
        hip: metricsForm.hip ? parseFloat(metricsForm.hip) : null,
        note: metricsForm.note || null,
      }

      if (metricsForm.id) {
        await updateBodyMetrics(metricsForm.id, recordData)
      } else {
        await createBodyMetrics(recordData)
      }

      await loadAllRecords()
      resetForm()
      setShowForm(false)
      alert('身体数据保存成功！')
    } catch (error) {
      console.error('Error saving body metrics:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDaily = async (id: string) => {
    if (!confirm('确定要删除这条每日健康记录吗？')) return
    try {
      await deleteDailyHealth(id)
      await loadAllRecords()
    } catch {
      alert('删除失败')
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm('确定要删除这条体测成绩吗？')) return
    try {
      await deleteFitnessTest(id)
      await loadAllRecords()
    } catch {
      alert('删除失败')
    }
  }

  const handleDeleteMetrics = async (id: string) => {
    if (!confirm('确定要删除这条身体数据吗？')) return
    try {
      await deleteBodyMetrics(id)
      await loadAllRecords()
    } catch {
      alert('删除失败')
    }
  }

  // 格式化时间（秒转分:秒）
  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return '-'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}'${s}"`
  }

  if (loading) {
    return <div className="text-white">加载中...</div>
  }

  const handleEditTest = (record: FitnessTest) => {
    setActiveTab('test')
    setTestForm({
      id: record.id,
      test_date: record.test_date,
      test_type: record.test_type,
      semester: record.semester || '',
      run_1000m_seconds: record.run_1000m_seconds?.toString() || '',
      pull_ups: record.pull_ups?.toString() || '',
      standing_jump: record.standing_jump?.toString() || '',
      sit_and_reach: record.sit_and_reach?.toString() || '',
      vital_capacity: record.vital_capacity?.toString() || '',
      total_score: record.total_score?.toString() || '',
      note: record.note || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditMetrics = (record: BodyMetrics) => {
    setActiveTab('metrics')
    setMetricsForm({
      id: record.id,
      record_date: record.record_date,
      body_fat: record.body_fat?.toString() || '',
      resting_hr: record.resting_hr?.toString() || '',
      chest: record.chest?.toString() || '',
      waist: record.waist?.toString() || '',
      hip: record.hip?.toString() || '',
      note: record.note || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 获取最新记录
  const latestTest = testRecords[0]
  const latestMetrics = metricsRecords[0]
  const latestDaily = dailyRecords[0]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">健康与体测</h1>
          <p className="text-gray-400 mt-1">追踪日常健康与学期体测成绩</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? '取消' : '添加记录'}
        </Button>
      </div>

      {/* 最新数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <Moon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">昨晚睡眠</p>
          <p className="text-xl font-bold text-white">
            {latestDaily?.sleep_hours || '-'} <span className="text-sm font-normal text-gray-500">h</span>
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">最新体重</p>
          <p className="text-xl font-bold text-white">
            {latestDaily?.weight || '-'} <span className="text-sm font-normal text-gray-500">kg</span>
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">静息心率</p>
          <p className="text-xl font-bold text-white">
            {latestMetrics?.resting_hr || '-'} <span className="text-sm font-normal text-gray-500">bpm</span>
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <Dumbbell className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">1000米跑</p>
          <p className="text-xl font-bold text-white">
            {formatTime(latestTest?.run_1000m_seconds)}
          </p>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg">
        <button
          onClick={() => { setActiveTab('daily'); setShowForm(false); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'daily' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
        >
          每日健康
        </button>
        <button
          onClick={() => { setActiveTab('test'); setShowForm(false); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'test' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
        >
          体测成绩
        </button>
        <button
          onClick={() => { setActiveTab('metrics'); setShowForm(false); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'metrics' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
        >
          身体围度
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && activeTab === 'daily' && (
        <Card title="记录每日健康">
          <form onSubmit={handleDailySubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">日期 *</label>
                <input type="date" value={dailyForm.record_date} onChange={(e) => setDailyForm({...dailyForm, record_date: e.target.value})} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">睡眠时间 (小时)</label>
                <input type="number" step="0.1" value={dailyForm.sleep_hours} onChange={(e) => setDailyForm({...dailyForm, sleep_hours: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">睡眠质量 (1-5)</label>
                <input type="number" min="1" max="5" value={dailyForm.sleep_quality} onChange={(e) => setDailyForm({...dailyForm, sleep_quality: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">体重 (kg)</label>
                <input type="number" step="0.1" value={dailyForm.weight} onChange={(e) => setDailyForm({...dailyForm, weight: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">运动类型</label>
                <input type="text" value={dailyForm.exercise_type} onChange={(e) => setDailyForm({...dailyForm, exercise_type: e.target.value})} placeholder="如：跑步、健身房、篮球" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">运动时长 (分钟)</label>
                <input type="number" value={dailyForm.exercise_minutes} onChange={(e) => setDailyForm({...dailyForm, exercise_minutes: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">备注</label>
              <textarea value={dailyForm.note} onChange={(e) => setDailyForm({...dailyForm, note: e.target.value})} rows={2} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存每日记录'}</Button>
            </div>
          </form>
        </Card>
      )}

      {showForm && activeTab === 'test' && (
        <Card title={testForm.id ? "编辑体测成绩" : "添加体测成绩"}>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">测试日期 *</label>
                <input type="date" value={testForm.test_date} onChange={(e) => setTestForm({...testForm, test_date: e.target.value})} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">学期/阶段</label>
                <input type="text" value={testForm.semester} onChange={(e) => setTestForm({...testForm, semester: e.target.value})} placeholder="如：大二上学期" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">测试类型 *</label>
                <select value={testForm.test_type} onChange={(e) => setTestForm({...testForm, test_type: e.target.value as 'school_test' | 'self_test'})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="school_test">学校体测</option>
                  <option value="self_test">个人自测</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">总分</label>
                <input type="number" step="0.1" value={testForm.total_score} onChange={(e) => setTestForm({...testForm, total_score: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">1000米跑 (秒)</label>
                <input type="number" value={testForm.run_1000m_seconds} onChange={(e) => setTestForm({...testForm, run_1000m_seconds: e.target.value})} placeholder="如: 210 (即3分30秒)" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">引体向上 (个)</label>
                <input type="number" value={testForm.pull_ups} onChange={(e) => setTestForm({...testForm, pull_ups: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">立定跳远 (cm)</label>
                <input type="number" value={testForm.standing_jump} onChange={(e) => setTestForm({...testForm, standing_jump: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">坐位体前屈 (cm)</label>
                <input type="number" step="0.1" value={testForm.sit_and_reach} onChange={(e) => setTestForm({...testForm, sit_and_reach: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">肺活量 (ml)</label>
                <input type="number" value={testForm.vital_capacity} onChange={(e) => setTestForm({...testForm, vital_capacity: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">备注</label>
              <textarea value={testForm.note} onChange={(e) => setTestForm({...testForm, note: e.target.value})} rows={2} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存体测成绩'}</Button>
            </div>
          </form>
        </Card>
      )}

      {showForm && activeTab === 'metrics' && (
        <Card title={metricsForm.id ? "编辑身体数据" : "添加身体数据"}>
          <form onSubmit={handleMetricsSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">测量日期 *</label>
                <input type="date" value={metricsForm.record_date} onChange={(e) => setMetricsForm({...metricsForm, record_date: e.target.value})} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">体脂率 (%)</label>
                <input type="number" step="0.1" value={metricsForm.body_fat} onChange={(e) => setMetricsForm({...metricsForm, body_fat: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">静息心率 (bpm)</label>
                <input type="number" value={metricsForm.resting_hr} onChange={(e) => setMetricsForm({...metricsForm, resting_hr: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">胸围 (cm)</label>
                <input type="number" step="0.1" value={metricsForm.chest} onChange={(e) => setMetricsForm({...metricsForm, chest: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">腰围 (cm)</label>
                <input type="number" step="0.1" value={metricsForm.waist} onChange={(e) => setMetricsForm({...metricsForm, waist: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">臀围 (cm)</label>
                <input type="number" step="0.1" value={metricsForm.hip} onChange={(e) => setMetricsForm({...metricsForm, hip: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">备注</label>
              <textarea value={metricsForm.note} onChange={(e) => setMetricsForm({...metricsForm, note: e.target.value})} rows={2} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存身体数据'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* 数据列表显示区 */}
      <Card title={activeTab === 'daily' ? "近期健康记录" : activeTab === 'test' ? "历次体测成绩" : "身体维度变化"}>
        {activeTab === 'daily' && dailyRecords.length === 0 && <div className="text-gray-500 text-center py-8">暂无每日记录</div>}
        {activeTab === 'test' && testRecords.length === 0 && <div className="text-gray-500 text-center py-8">暂无体测成绩</div>}
        {activeTab === 'metrics' && metricsRecords.length === 0 && <div className="text-gray-500 text-center py-8">暂无身体数据</div>}

        <div className="space-y-4">
          {activeTab === 'daily' && dailyRecords.map((record) => (
            <div key={record.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{record.record_date}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteDaily(record.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                {record.sleep_hours && <span>睡眠: {record.sleep_hours}h</span>}
                {record.weight && <span>体重: {record.weight}kg</span>}
                {record.exercise_type && <span>运动: {record.exercise_type} {record.exercise_minutes}min</span>}
              </div>
            </div>
          ))}

          {activeTab === 'test' && testRecords.map((record) => (
            <div key={record.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{record.semester || record.test_date} ({record.test_type === 'school_test' ? '学校体测' : '自测'})</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditTest(record)} className="p-1 text-gray-400 hover:text-blue-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteTest(record.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                {record.total_score && <span>总分: <span className="text-blue-400 font-bold">{record.total_score}</span></span>}
                {record.run_1000m_seconds && <span>1000m: {formatTime(record.run_1000m_seconds)}</span>}
                {record.pull_ups && <span>引体: {record.pull_ups}个</span>}
                {record.sit_and_reach && <span>体前屈: {record.sit_and_reach}cm</span>}
              </div>
            </div>
          ))}

          {activeTab === 'metrics' && metricsRecords.map((record) => (
            <div key={record.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{record.record_date}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditMetrics(record)} className="p-1 text-gray-400 hover:text-blue-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteMetrics(record.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                {record.body_fat && <span>体脂率: {record.body_fat}%</span>}
                {record.resting_hr && <span>心率: {record.resting_hr}bpm</span>}
                {record.waist && <span>腰围: {record.waist}cm</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

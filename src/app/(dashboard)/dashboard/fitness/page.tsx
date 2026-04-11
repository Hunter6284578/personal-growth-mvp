'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Activity, Moon, Heart, Dumbbell, X } from 'lucide-react'
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
import { useToast } from '@/components/ui/Toast'
import { useConfirm, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  DailyHealthPanel,
  type DailyHealthForm,
  initialForm as initialDailyForm,
} from '@/components/dashboard/fitness/DailyHealthPanel'
import {
  FitnessTestPanel,
  type FitnessTestForm,
  initialForm as initialTestForm,
} from '@/components/dashboard/fitness/FitnessTestPanel'
import {
  BodyMetricsPanel,
  type BodyMetricsForm,
  initialForm as initialMetricsForm,
} from '@/components/dashboard/fitness/BodyMetricsPanel'

export default function FitnessPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { confirm, cancel, dialogState } = useConfirm()
  const [activeTab, setActiveTab] = useState<'daily' | 'test' | 'metrics'>('daily')

  // ================= 状态定义 =================
  const [dailyRecords, setDailyRecords] = useState<DailyHealth[]>([])
  const [dailyForm, setDailyForm] = useState<DailyHealthForm>(initialDailyForm)

  const [testRecords, setTestRecords] = useState<FitnessTest[]>([])
  const [testForm, setTestForm] = useState<FitnessTestForm>(initialTestForm)

  const [metricsRecords, setMetricsRecords] = useState<BodyMetrics[]>([])
  const [metricsForm, setMetricsForm] = useState<BodyMetricsForm>(initialMetricsForm)

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

  useEffect(() => {
    if (user) {
      void loadAllRecords()
    }
  }, [user, loadAllRecords])

  // ================= 表单重置 =================
  const resetForms = () => {
    setDailyForm(initialDailyForm)
    setTestForm(initialTestForm)
    setMetricsForm(initialMetricsForm)
  }

  // ================= 提交处理 =================
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
      resetForms()
      setShowForm(false)
      toast('每日健康记录保存成功！', 'success')
    } catch (error) {
      console.error('Error saving daily health:', error)
      toast('保存失败，请重试', 'error')
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
      resetForms()
      setShowForm(false)
      toast('体测成绩保存成功！', 'success')
    } catch (error) {
      console.error('Error saving fitness test:', error)
      toast('保存失败，请重试', 'error')
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
      resetForms()
      setShowForm(false)
      toast('身体数据保存成功！', 'success')
    } catch (error) {
      console.error('Error saving body metrics:', error)
      toast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ================= 删除处理 =================
  const handleDeleteDaily = async (id: string) => {
    const confirmed = await confirm({ message: '确定要删除这条每日健康记录吗？', variant: 'danger' })
    if (!confirmed) return
    try {
      await deleteDailyHealth(id)
      await loadAllRecords()
    } catch {
      toast('删除失败', 'error')
    }
  }

  const handleDeleteTest = async (id: string) => {
    const confirmed = await confirm({ message: '确定要删除这条体测成绩吗？', variant: 'danger' })
    if (!confirmed) return
    try {
      await deleteFitnessTest(id)
      await loadAllRecords()
    } catch {
      toast('删除失败', 'error')
    }
  }

  const handleDeleteMetrics = async (id: string) => {
    const confirmed = await confirm({ message: '确定要删除这条身体数据吗？', variant: 'danger' })
    if (!confirmed) return
    try {
      await deleteBodyMetrics(id)
      await loadAllRecords()
    } catch {
      toast('删除失败', 'error')
    }
  }

  // ================= 编辑处理 =================
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

  // ================= 格式化工具 =================
  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return '-'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}'${s}"`
  }

  if (loading) {
    return <div style={{ color: 'var(--text)' }}>加载中...</div>
  }

  // 最新数据概览
  const latestTest = testRecords[0]
  const latestMetrics = metricsRecords[0]
  const latestDaily = dailyRecords[0]

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-bright)' }}>健康与体测</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>追踪日常健康与学期体测成绩</p>
        </div>
        <Button onClick={() => { resetForms(); setShowForm(!showForm); }}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? '取消' : '添加记录'}
        </Button>
      </div>

      {/* 最新数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pg-card-soft p-4 text-center">
          <Moon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--dash-stat-social)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>昨晚睡眠</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text-bright)' }}>
            {latestDaily?.sleep_hours || '-'} <span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>h</span>
          </p>
        </div>
        <div className="pg-card-soft p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--dash-stat-execution)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>最新体重</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text-bright)' }}>
            {latestDaily?.weight || '-'} <span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>kg</span>
          </p>
        </div>
        <div className="pg-card-soft p-4 text-center">
          <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--dash-stat-physical)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>静息心率</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text-bright)' }}>
            {latestMetrics?.resting_hr || '-'} <span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>bpm</span>
          </p>
        </div>
        <div className="pg-card-soft p-4 text-center">
          <Dumbbell className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--dash-stat-emotion)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>1000米跑</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text-bright)' }}>
            {formatTime(latestTest?.run_1000m_seconds)}
          </p>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex space-x-1 p-1 rounded-lg" style={{ background: 'var(--dash-card-soft)' }}>
        {(['daily', 'test', 'metrics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all`}
            style={{
              background: activeTab === tab ? 'var(--dash-surface)' : 'transparent',
              color: activeTab === tab ? 'var(--text-bright)' : 'var(--text-muted)',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {tab === 'daily' ? '每日健康' : tab === 'test' ? '体测成绩' : '身体围度'}
          </button>
        ))}
      </div>

      {/* 面板渲染区域 - 委托给子组件 */}
      {activeTab === 'daily' && (
        <DailyHealthPanel
          records={dailyRecords}
          form={dailyForm}
          setForm={setDailyForm}
          saving={saving}
          showForm={showForm}
          onSubmit={handleDailySubmit}
          onCancel={() => setShowForm(false)}
          onDelete={handleDeleteDaily}
        />
      )}

      {activeTab === 'test' && (
        <FitnessTestPanel
          records={testRecords}
          form={testForm}
          setForm={setTestForm}
          saving={saving}
          showForm={showForm}
          onSubmit={handleTestSubmit}
          onCancel={() => setShowForm(false)}
          onDelete={handleDeleteTest}
          onEdit={handleEditTest}
        />
      )}

      {activeTab === 'metrics' && (
        <BodyMetricsPanel
          records={metricsRecords}
          form={metricsForm}
          setForm={setMetricsForm}
          saving={saving}
          showForm={showForm}
          onSubmit={handleMetricsSubmit}
          onCancel={() => setShowForm(false)}
          onDelete={handleDeleteMetrics}
          onEdit={handleEditMetrics}
        />
      )}

      <ConfirmDialog
        open={dialogState.open}
        onConfirm={dialogState.onConfirm}
        onCancel={cancel}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
      />
    </div>
  )
}

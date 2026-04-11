'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import type { DailyHealth } from '@/types'

interface DailyHealthForm {
  record_date: string
  sleep_hours: string
  sleep_quality: string
  weight: string
  exercise_type: string
  exercise_minutes: string
  note: string
}

const initialForm: DailyHealthForm = {
  record_date: new Date().toISOString().split('T')[0],
  sleep_hours: '',
  sleep_quality: '',
  weight: '',
  exercise_type: '',
  exercise_minutes: '',
  note: ''
}

interface DailyHealthPanelProps {
  records: DailyHealth[]
  form: DailyHealthForm
  setForm: (form: DailyHealthForm) => void
  saving: boolean
  showForm: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onDelete: (id: string) => void
}

export function DailyHealthPanel({
  records, form, setForm, saving, showForm, onSubmit, onCancel, onDelete
}: DailyHealthPanelProps) {
  return (
    <>
      {showForm && (
        <Card title="记录每日健康">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>日期 *</label>
                <input type="date" value={form.record_date} onChange={(e) => setForm({...form, record_date: e.target.value})} required className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>睡眠时间 (小时)</label>
                <input type="number" step="0.1" value={form.sleep_hours} onChange={(e) => setForm({...form, sleep_hours: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>睡眠质量 (1-5)</label>
                <input type="number" min="1" max="5" value={form.sleep_quality} onChange={(e) => setForm({...form, sleep_quality: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>体重 (kg)</label>
                <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>运动类型</label>
                <input type="text" value={form.exercise_type} onChange={(e) => setForm({...form, exercise_type: e.target.value})} placeholder="如：跑步、健身房、篮球" className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>运动时长 (分钟)</label>
                <input type="number" value={form.exercise_minutes} onChange={(e) => setForm({...form, exercise_minutes: e.target.value})} className="pg-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>备注</label>
              <textarea value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} rows={2} className="pg-input resize-none"></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存每日记录'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="近期健康记录">
        {records.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>暂无每日记录</div>}
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="p-4 rounded-lg border transition-colors" style={{ background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{record.record_date}</span>
                <div className="flex gap-2">
                  <button onClick={() => onDelete(record.id)} className="p-1" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dash-danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  ><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {record.sleep_hours && <span>睡眠: {record.sleep_hours}h</span>}
                {record.weight && <span>体重: {record.weight}kg</span>}
                {record.exercise_type && <span>运动: {record.exercise_type} {record.exercise_minutes}min</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export { type DailyHealthForm, initialForm }

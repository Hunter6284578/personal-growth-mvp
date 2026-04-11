'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trash2, Edit2 } from 'lucide-react'
import type { BodyMetrics } from '@/types'

interface BodyMetricsForm {
  id: string
  record_date: string
  body_fat: string
  resting_hr: string
  chest: string
  waist: string
  hip: string
  note: string
}

const initialForm: BodyMetricsForm = {
  id: '',
  record_date: new Date().toISOString().split('T')[0],
  body_fat: '',
  resting_hr: '',
  chest: '',
  waist: '',
  hip: '',
  note: ''
}

interface BodyMetricsPanelProps {
  records: BodyMetrics[]
  form: BodyMetricsForm
  setForm: (form: BodyMetricsForm) => void
  saving: boolean
  showForm: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onDelete: (id: string) => void
  onEdit: (record: BodyMetrics) => void
}

export function BodyMetricsPanel({
  records, form, setForm, saving, showForm, onSubmit, onCancel, onDelete, onEdit
}: BodyMetricsPanelProps) {
  return (
    <>
      {showForm && (
        <Card title={form.id ? "编辑身体数据" : "添加身体数据"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>测量日期 *</label>
                <input type="date" value={form.record_date} onChange={(e) => setForm({...form, record_date: e.target.value})} required className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>体脂率 (%)</label>
                <input type="number" step="0.1" value={form.body_fat} onChange={(e) => setForm({...form, body_fat: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>静息心率 (bpm)</label>
                <input type="number" value={form.resting_hr} onChange={(e) => setForm({...form, resting_hr: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>胸围 (cm)</label>
                <input type="number" step="0.1" value={form.chest} onChange={(e) => setForm({...form, chest: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>腰围 (cm)</label>
                <input type="number" step="0.1" value={form.waist} onChange={(e) => setForm({...form, waist: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>臀围 (cm)</label>
                <input type="number" step="0.1" value={form.hip} onChange={(e) => setForm({...form, hip: e.target.value})} className="pg-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>备注</label>
              <textarea value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} rows={2} className="pg-input resize-none"></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存身体数据'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="身体维度变化">
        {records.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>暂无身体数据</div>}
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="p-4 rounded-lg border transition-colors" style={{ background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{record.record_date}</span>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(record)} className="p-1" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dash-info)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  ><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(record.id)} className="p-1" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dash-danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  ><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {record.body_fat && <span>体脂率: {record.body_fat}%</span>}
                {record.resting_hr && <span>心率: {record.resting_hr}bpm</span>}
                {record.waist && <span>腰围: {record.waist}cm</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export { type BodyMetricsForm, initialForm }

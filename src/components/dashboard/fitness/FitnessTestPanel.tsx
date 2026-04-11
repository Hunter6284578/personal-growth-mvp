'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trash2, Edit2 } from 'lucide-react'
import type { FitnessTest } from '@/types'

interface FitnessTestForm {
  id: string
  test_date: string
  test_type: 'school_test' | 'self_test'
  semester: string
  run_1000m_seconds: string
  pull_ups: string
  standing_jump: string
  sit_and_reach: string
  vital_capacity: string
  total_score: string
  note: string
}

const initialForm: FitnessTestForm = {
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
}

interface FitnessTestPanelProps {
  records: FitnessTest[]
  form: FitnessTestForm
  setForm: (form: FitnessTestForm) => void
  saving: boolean
  showForm: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onDelete: (id: string) => void
  onEdit: (record: FitnessTest) => void
}

function formatTime(seconds: number | null | undefined) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}'${s}"`
}

export function FitnessTestPanel({
  records, form, setForm, saving, showForm, onSubmit, onCancel, onDelete, onEdit
}: FitnessTestPanelProps) {
  return (
    <>
      {showForm && (
        <Card title={form.id ? "编辑体测成绩" : "添加体测成绩"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>测试日期 *</label>
                <input type="date" value={form.test_date} onChange={(e) => setForm({...form, test_date: e.target.value})} required className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>学期/阶段</label>
                <input type="text" value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})} placeholder="如：大二上学期" className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>测试类型 *</label>
                <select value={form.test_type} onChange={(e) => setForm({...form, test_type: e.target.value as 'school_test' | 'self_test'})} className="pg-input">
                  <option value="school_test">学校体测</option>
                  <option value="self_test">个人自测</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>总分</label>
                <input type="number" step="0.1" value={form.total_score} onChange={(e) => setForm({...form, total_score: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>1000米跑 (秒)</label>
                <input type="number" value={form.run_1000m_seconds} onChange={(e) => setForm({...form, run_1000m_seconds: e.target.value})} placeholder="如: 210 (即3分30秒)" className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>引体向上 (个)</label>
                <input type="number" value={form.pull_ups} onChange={(e) => setForm({...form, pull_ups: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>立定跳远 (cm)</label>
                <input type="number" value={form.standing_jump} onChange={(e) => setForm({...form, standing_jump: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>坐位体前屈 (cm)</label>
                <input type="number" step="0.1" value={form.sit_and_reach} onChange={(e) => setForm({...form, sit_and_reach: e.target.value})} className="pg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>肺活量 (ml)</label>
                <input type="number" value={form.vital_capacity} onChange={(e) => setForm({...form, vital_capacity: e.target.value})} className="pg-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>备注</label>
              <textarea value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} rows={2} className="pg-input resize-none"></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存体测成绩'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="历次体测成绩">
        {records.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>暂无体测成绩</div>}
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="p-4 rounded-lg border transition-colors" style={{ background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{record.semester || record.test_date} ({record.test_type === 'school_test' ? '学校体测' : '自测'})</span>
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
                {record.total_score && <span>总分: <span style={{ color: 'var(--dash-info)', fontWeight: 'bold' }}>{record.total_score}</span></span>}
                {record.run_1000m_seconds && <span>1000m: {formatTime(record.run_1000m_seconds)}</span>}
                {record.pull_ups && <span>引体: {record.pull_ups}个</span>}
                {record.sit_and_reach && <span>体前屈: {record.sit_and_reach}cm</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export { type FitnessTestForm, initialForm, formatTime }

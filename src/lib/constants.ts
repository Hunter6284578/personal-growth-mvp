export const STAT_CONFIG = [
  { key: 'physical_score', label: '身体素质', color: '#EF4444', shortLabel: '体质' },
  { key: 'execution_score', label: '执行力', color: '#3B82F6', shortLabel: '执行' },
  { key: 'focus_score', label: '专注力', color: '#10B981', shortLabel: '专注' },
  { key: 'emotion_score', label: '情绪稳定性', color: '#F59E0B', shortLabel: '情绪' },
  { key: 'social_score', label: '社交状态', color: '#8B5CF6', shortLabel: '社交' },
  { key: 'creativity_score', label: '创造力', color: '#EC4899', shortLabel: '创造' },
] as const

export type StatKey = (typeof STAT_CONFIG)[number]['key']

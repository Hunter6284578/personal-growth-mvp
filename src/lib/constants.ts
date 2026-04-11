export const STAT_CONFIG = [
  { key: 'physical_score', label: '身体素质', color: 'var(--dash-stat-physical)', shortLabel: '体质' },
  { key: 'execution_score', label: '执行力', color: 'var(--dash-stat-execution)', shortLabel: '执行' },
  { key: 'focus_score', label: '专注力', color: 'var(--dash-stat-focus)', shortLabel: '专注' },
  { key: 'emotion_score', label: '情绪稳定性', color: 'var(--dash-stat-emotion)', shortLabel: '情绪' },
  { key: 'social_score', label: '社交状态', color: 'var(--dash-stat-social)', shortLabel: '社交' },
  { key: 'creativity_score', label: '创造力', color: 'var(--dash-stat-creativity)', shortLabel: '创造' },
] as const

export type StatKey = (typeof STAT_CONFIG)[number]['key']

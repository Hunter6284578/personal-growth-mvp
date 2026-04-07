// ==================== 健身模块类型定义 ====================

// 训练组
export interface FitSet {
  set_index: number
  weight: number
  reps: number
  rir: number
  volume: number
}

// 动作库
export interface FitExercise {
  id: string
  name: string
  target_muscle: string
  category: 'free_weight' | 'machine' | 'cable' | 'band' | 'bodyweight'
  equipment: string | null
  notes: string | null
  created_at: string
}

// 训练记录
export interface FitLog {
  id: string
  user_id: string
  date: string
  exercise_id: string
  exercise?: FitExercise
  sets: FitSet[]
  total_volume: number
  total_sets: number
  note: string | null
  created_at: string
}

// AI 训练计划 - 输出格式
export interface AIPlanExercise {
  exercise_id: string
  name: string
  target_sets: number
  rep_range: string
  intensity_guideline: string
  rationale: string
}

export interface AIPlan {
  plan_date: string
  focus_area: string
  exercises: AIPlanExercise[]
}

// 肌群分类标签
export const MUSCLE_GROUPS = [
  '三角肌中束',
  '三角肌前束/中束',
  '三角肌后束',
  '三角肌后束/背阔肌',
  '胸大肌',
  '胸大肌上束',
  '胸大肌下束/三头',
  '股四头肌/臀大肌',
  '腘绳肌/臀大肌',
  '核心',
  '背阔肌/二头',
  '肱二头肌',
  '肱三头肌',
] as const

export const EQUIPMENT_LABELS: Record<string, string> = {
  dumbbell: '哑铃',
  barbell: '杠铃',
  band: '阻力带',
  cable: '绳索',
  machine: '器械',
} as const

export const CATEGORY_LABELS: Record<string, string> = {
  free_weight: '自由重量',
  machine: '器械',
  cable: '绳索',
  band: '阻力带',
  bodyweight: '自重',
} as const

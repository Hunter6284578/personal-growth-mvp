// 用户资料
export interface Profile {
  id: string
  user_id: string
  character_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

// 属性评分
export interface StatScore {
  id: string
  user_id: string
  score_date: string
  physical_score: number
  execution_score: number
  focus_score: number
  emotion_score: number
  social_score: number
  creativity_score: number
  note: string | null
  created_at: string
}

// 每日记录
export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  summary: string | null
  good_points: string | null
  bad_points: string | null
  reflection: string | null
  tomorrow_plan: string | null
  mood_score: number | null
  created_at: string
  updated_at: string
}

// 经历事件
export interface LifeEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  event_date: string
  tags: string[] | null
  affected_stats: string[] | null
  impact_level: number | null
  images: string[] | null
  created_at: string
}

// 体测记录 (旧版，保留兼容)
export interface FitnessRecord {
  id: string
  user_id: string
  record_date: string
  weight: number | null
  body_fat: number | null
  run_1000m_seconds: number | null
  pull_ups: number | null
  push_ups: number | null
  sit_and_reach: number | null
  vital_capacity: number | null
  resting_hr: number | null
  sleep_hours: number | null
  note: string | null
  created_at: string
}

// 每日健康记录（睡眠、运动、体重）
export interface DailyHealth {
  id: string
  user_id: string
  record_date: string
  sleep_hours: number | null
  sleep_quality: number | null  // 1-5
  weight: number | null
  exercise_type: string | null
  exercise_minutes: number | null
  note: string | null
  created_at: string
  updated_at: string
}

// 体测成绩（学校体测/自测）
export interface FitnessTest {
  id: string
  user_id: string
  test_date: string
  test_type: 'school_test' | 'self_test'
  semester: string | null
  run_1000m_seconds: number | null
  pull_ups: number | null
  standing_jump: number | null  // cm
  sit_and_reach: number | null
  vital_capacity: number | null
  total_score: number | null
  note: string | null
  created_at: string
}

// 身体数据（体脂、心率、围度等）
export interface BodyMetrics {
  id: string
  user_id: string
  record_date: string
  body_fat: number | null
  resting_hr: number | null
  chest: number | null  // cm
  waist: number | null  // cm
  hip: number | null    // cm
  note: string | null
  created_at: string
}

// 博客文章
export interface BlogPost {
  id: string
  user_id: string
  title: string
  slug: string
  summary: string | null
  content: string
  tags: string[] | null
  images: string[] | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

// 想法/短内容
export interface Thought {
  id: string
  user_id: string
  content: string
  tags: string[] | null
  images: string[] | null
  created_at: string
}

// AI 分析
export interface AIAnalysis {
  id: string
  user_id: string
  analysis_type: string
  input_summary: string | null
  result: string
  created_at: string
}

// 文件上传
export interface UploadedFile {
  id: string
  user_id: string
  file_url: string
  file_type: string
  related_type: string | null
  related_id: string | null
  created_at: string
}

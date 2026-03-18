import { supabase } from './supabase'
import type {
  Profile,
  StatScore,
  DailyLog,
  LifeEvent,
  FitnessRecord,
  DailyHealth,
  FitnessTest,
  BodyMetrics,
  BlogPost,
  Thought,
  AIAnalysis,
} from '@/types'

// ==================== Profile Services ====================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function upsertProfile(profile: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}

// ==================== Stat Score Services ====================

export async function getStatScores(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as StatScore[]
}

export async function getLatestStatScore(userId: string) {
  const { data, error } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as StatScore | null
}

export async function createStatScore(score: Partial<StatScore>) {
  const { data, error } = await supabase
    .from('stat_scores')
    .insert(score)
    .select()
    .single()
  
  if (error) throw error
  return data as StatScore
}

// ==================== Daily Log Services ====================

export async function getDailyLogs(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as DailyLog[]
}

export async function getDailyLogByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as DailyLog | null
}

export async function upsertDailyLog(log: Partial<DailyLog>) {
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(log)
    .select()
    .single()
  
  if (error) throw error
  return data as DailyLog
}

export async function deleteDailyLog(id: string) {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Life Event Services ====================

export async function getLifeEvents(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('life_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as LifeEvent[]
}

export async function createLifeEvent(event: Partial<LifeEvent>) {
  const { data, error } = await supabase
    .from('life_events')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data as LifeEvent
}

export async function updateLifeEvent(id: string, event: Partial<LifeEvent>) {
  const { data, error } = await supabase
    .from('life_events')
    .update(event)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as LifeEvent
}

export async function deleteLifeEvent(id: string) {
  const { error } = await supabase
    .from('life_events')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Fitness Record Services ====================

export async function getFitnessRecords(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('fitness_records')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as FitnessRecord[]
}

export async function createFitnessRecord(record: Partial<FitnessRecord>) {
  const { data, error } = await supabase
    .from('fitness_records')
    .insert(record)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessRecord
}

export async function updateFitnessRecord(id: string, record: Partial<FitnessRecord>) {
  const { data, error } = await supabase
    .from('fitness_records')
    .update(record)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessRecord
}

export async function deleteFitnessRecord(id: string) {
  const { error } = await supabase
    .from('fitness_records')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Daily Health Services (每日健康) ====================

export async function getDailyHealthRecords(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('daily_health')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as DailyHealth[]
}

export async function getDailyHealthByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_health')
    .select('*')
    .eq('user_id', userId)
    .eq('record_date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as DailyHealth | null
}

export async function upsertDailyHealth(record: Partial<DailyHealth>) {
  const { data, error } = await supabase
    .from('daily_health')
    .upsert(record, { onConflict: 'user_id,record_date' })
    .select()
    .single()
  
  if (error) throw error
  return data as DailyHealth
}

export async function deleteDailyHealth(id: string) {
  const { error } = await supabase
    .from('daily_health')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Fitness Test Services (体测成绩) ====================

export async function getFitnessTests(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('fitness_tests')
    .select('*')
    .eq('user_id', userId)
    .order('test_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as FitnessTest[]
}

export async function createFitnessTest(test: Partial<FitnessTest>) {
  const { data, error } = await supabase
    .from('fitness_tests')
    .insert(test)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessTest
}

export async function updateFitnessTest(id: string, test: Partial<FitnessTest>) {
  const { data, error } = await supabase
    .from('fitness_tests')
    .update(test)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as FitnessTest
}

export async function deleteFitnessTest(id: string) {
  const { error } = await supabase
    .from('fitness_tests')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Body Metrics Services (身体数据) ====================

export async function getBodyMetrics(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as BodyMetrics[]
}

export async function createBodyMetrics(metrics: Partial<BodyMetrics>) {
  const { data, error } = await supabase
    .from('body_metrics')
    .insert(metrics)
    .select()
    .single()
  
  if (error) throw error
  return data as BodyMetrics
}

export async function updateBodyMetrics(id: string, metrics: Partial<BodyMetrics>) {
  const { data, error } = await supabase
    .from('body_metrics')
    .update(metrics)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as BodyMetrics
}

export async function deleteBodyMetrics(id: string) {
  const { error } = await supabase
    .from('body_metrics')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Blog Post Services ====================

export async function getBlogPosts(status?: 'draft' | 'published', limit = 50) {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data as BlogPost
}

export async function createBlogPost(post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()
  
  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as BlogPost
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== Thought Services ====================

export async function getThoughts(limit = 50) {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Thought[]
}

export async function createThought(thought: Partial<Thought>) {
  const { data, error } = await supabase
    .from('thoughts')
    .insert(thought)
    .select()
    .single()
  
  if (error) throw error
  return data as Thought
}

export async function updateThought(id: string, thought: Partial<Thought>) {
  const { data, error } = await supabase
    .from('thoughts')
    .update(thought)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Thought
}

export async function deleteThought(id: string) {
  const { error } = await supabase
    .from('thoughts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ==================== AI Analysis Services ====================

export async function getAIAnalyses(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as AIAnalysis[]
}

export async function createAIAnalysis(analysis: Partial<AIAnalysis>) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert(analysis)
    .select()
    .single()
  
  if (error) throw error
  return data as AIAnalysis
}

import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import type { SkillGroup, SkillItem } from '@/types'

export async function getSkillGroups(userId?: string) {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('skill_groups')
    .select('*, skill_items(*)')
    .order('sort_order', { ascending: true })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  
  handleSupabaseError(error, { action: 'getSkillGroups', userId })
  return (data ?? []) as (SkillGroup & { items: SkillItem[] })[]
}

export async function getSkillGroupById(id: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('skill_groups')
    .select('*, skill_items(*)')
    .eq('id', id)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    handleSupabaseError(error, { action: 'getSkillGroupById', groupId: id })
  }
  return data as (SkillGroup & { items: SkillItem[] }) | null
}

export async function createSkillGroup(group: Partial<SkillGroup>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('skill_groups')
    .insert(group)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createSkillGroup' })
  return data as SkillGroup
}

export async function updateSkillGroup(id: string, group: Partial<SkillGroup>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('skill_groups')
    .update(group)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateSkillGroup', groupId: id })
  return data as SkillGroup
}

export async function deleteSkillGroup(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('skill_groups')
    .delete()
    .eq('id', id)
  
  handleSupabaseError(error, { action: 'deleteSkillGroup', groupId: id })
}

export async function createSkillItem(item: Partial<SkillItem>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('skill_items')
    .insert(item)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createSkillItem' })
  return data as SkillItem
}

export async function updateSkillItem(id: string, item: Partial<SkillItem>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('skill_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateSkillItem', itemId: id })
  return data as SkillItem
}

export async function deleteSkillItem(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('skill_items')
    .delete()
    .eq('id', id)
  
  handleSupabaseError(error, { action: 'deleteSkillItem', itemId: id })
}

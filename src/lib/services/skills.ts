import { supabase } from '../supabase'
import type { SkillGroup, SkillItem } from '@/types'

export async function getSkillGroups(userId?: string) {
  let query = supabase
    .from('skill_groups')
    .select('*, skill_items(*)')
    .order('sort_order', { ascending: true })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as (SkillGroup & { items: SkillItem[] })[]
}

export async function getSkillGroupById(id: string) {
  const { data, error } = await supabase
    .from('skill_groups')
    .select('*, skill_items(*)')
    .eq('id', id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data as (SkillGroup & { items: SkillItem[] }) | null
}

export async function createSkillGroup(group: Partial<SkillGroup>) {
  const { data, error } = await supabase
    .from('skill_groups')
    .insert(group)
    .select()
    .single()
  
  if (error) throw error
  return data as SkillGroup
}

export async function updateSkillGroup(id: string, group: Partial<SkillGroup>) {
  const { data, error } = await supabase
    .from('skill_groups')
    .update(group)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as SkillGroup
}

export async function deleteSkillGroup(id: string) {
  const { error } = await supabase
    .from('skill_groups')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function createSkillItem(item: Partial<SkillItem>) {
  const { data, error } = await supabase
    .from('skill_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data as SkillItem
}

export async function updateSkillItem(id: string, item: Partial<SkillItem>) {
  const { data, error } = await supabase
    .from('skill_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as SkillItem
}

export async function deleteSkillItem(id: string) {
  const { error } = await supabase
    .from('skill_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

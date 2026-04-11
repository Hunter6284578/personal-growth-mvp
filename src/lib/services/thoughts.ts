import { supabase } from '../supabase'
import { deleteImage } from '../upload'
import type { Thought } from '@/types'

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
  const { data: thought } = await supabase
    .from('thoughts')
    .select('images')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('thoughts')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  if (thought?.images && thought.images.length > 0) {
    for (const url of thought.images) {
      await deleteImage(url).catch(console.error)
    }
  }
}

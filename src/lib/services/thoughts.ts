import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import { deleteImage } from '../upload'
import type { Thought } from '@/types'

export async function getThoughts(limit = 50) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getThoughts' })
  return (data ?? []) as Thought[]
}

export async function createThought(thought: Partial<Thought>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('thoughts')
    .insert(thought)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createThought' })
  return data as Thought
}

export async function updateThought(id: string, thought: Partial<Thought>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('thoughts')
    .update(thought)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateThought', thoughtId: id })
  return data as Thought
}

export async function deleteThought(id: string, userId: string) {
  const supabase = getSupabaseClient()
  const { data: thought, error: fetchError } = await supabase
    .from('thoughts')
    .select('images')
    .eq('id', id)
    .single()

  handleSupabaseError(fetchError, { action: 'deleteThought', stage: 'fetch', thoughtId: id, userId })

  const { error } = await supabase
    .from('thoughts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  handleSupabaseError(error, { action: 'deleteThought', stage: 'delete', thoughtId: id, userId })

  if (thought?.images && thought.images.length > 0) {
    for (const url of thought.images) {
      await deleteImage(url).catch(console.error)
    }
  }
}

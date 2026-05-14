import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import { deleteImage } from '../upload'
import type { LifeEvent } from '@/types'

export async function getLifeEvents(userId: string, limit = 50) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('life_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: false })
    .limit(limit)
  
  handleSupabaseError(error, { action: 'getLifeEvents', userId })
  return (data ?? []) as LifeEvent[]
}

export async function createLifeEvent(event: Partial<LifeEvent>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('life_events')
    .insert(event)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createLifeEvent' })
  return data as LifeEvent
}

export async function updateLifeEvent(id: string, event: Partial<LifeEvent>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('life_events')
    .update(event)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateLifeEvent', eventId: id })
  return data as LifeEvent
}

export async function deleteLifeEvent(id: string, userId?: string) {
  const supabase = getSupabaseClient()
  const { data: event, error: fetchError } = await supabase
    .from('life_events')
    .select('images')
    .eq('id', id)
    .single()

  handleSupabaseError(fetchError, { action: 'deleteLifeEvent', stage: 'fetch', eventId: id, userId })

  let deleteQuery = supabase
    .from('life_events')
    .delete()
    .eq('id', id)

  if (userId) {
    deleteQuery = deleteQuery.eq('user_id', userId)
  }

  const { error } = await deleteQuery
  handleSupabaseError(error, { action: 'deleteLifeEvent', stage: 'delete', eventId: id, userId })

  if (event?.images && event.images.length > 0) {
    for (const url of event.images) {
      await deleteImage(url).catch(console.error)
    }
  }
}

import { supabase } from '../supabase'
import { deleteImage } from '../upload'
import type { LifeEvent } from '@/types'

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
  const { data: event } = await supabase
    .from('life_events')
    .select('images')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('life_events')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  if (event?.images && event.images.length > 0) {
    for (const url of event.images) {
      await deleteImage(url).catch(console.error)
    }
  }
}

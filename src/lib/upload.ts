import { getSupabaseClient } from './supabase'
import { logError } from './logger'

export async function uploadImage(file: File, bucket = 'images'): Promise<string> {
  const supabase = getSupabaseClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (uploadError) {
    logError(uploadError, { action: 'uploadImage', bucket })
    throw uploadError
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteImage(url: string, bucket = 'images'): Promise<void> {
  const supabase = getSupabaseClient()
  // Extract file path from public URL
  const pathMatch = url.match(new RegExp(`${bucket}/(.+)$`))
  if (!pathMatch || !pathMatch[1]) return

  const filePath = pathMatch[1]

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    logError(error, { action: 'deleteImage', bucket })
    throw error
  }
}

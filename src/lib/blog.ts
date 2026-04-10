import { cache } from 'react'
import type { BlogPost } from '@/types'
import { getPublicSupabaseClient } from '@/lib/supabase-public'

export const getPublishedPosts = cache(async () => {
  let supabase
  try {
    supabase = getPublicSupabaseClient()
  } catch {
    return [] as BlogPost[]
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as BlogPost[]
})

export const getPublishedPostBySlug = cache(async (slug: string) => {
  let supabase
  try {
    supabase = getPublicSupabaseClient()
  } catch {
    return null
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .single()

  if (error) {
    return null
  }

  return data as BlogPost
})

export async function getBlogTags() {
  const posts = await getPublishedPosts()
  return Array.from(
    new Set(posts.flatMap((post) => post.tags ?? []))
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

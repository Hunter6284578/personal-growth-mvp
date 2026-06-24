import { cache } from 'react'
import type { BlogComment, BlogPost } from '@/types'
import { getPublicSupabaseClient } from '@/lib/supabase-public'

export const getPublishedPosts = cache(async () => {
  let supabase
  try {
    supabase = getPublicSupabaseClient()
  } catch {
    return [] as BlogPost[]
  }

  let result
  try {
    result = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
  } catch {
    return [] as BlogPost[]
  }

  const { data, error } = result

  if (error) {
    return [] as BlogPost[]
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

  let result
  try {
    result = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .eq('slug', slug)
      .single()
  } catch {
    return null
  }

  const { data, error } = result

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

export async function getBlogCategories() {
  const posts = await getPublishedPosts()
  return Array.from(
    new Set(
      posts
        .map((post) => post.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

export async function getApprovedComments(postId: string) {
  let supabase
  try {
    supabase = getPublicSupabaseClient()
  } catch {
    return [] as BlogComment[]
  }

  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error) {
    return [] as BlogComment[]
  }

  return (data ?? []) as BlogComment[]
}

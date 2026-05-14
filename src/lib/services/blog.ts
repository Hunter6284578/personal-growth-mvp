import { getSupabaseClient, handleSupabaseError } from '@/lib/supabase'
import { deleteImage } from '../upload'
import type { BlogPost } from '@/types'

export async function getBlogPosts(status?: 'draft' | 'published', limit = 50) {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  handleSupabaseError(error, { action: 'getBlogPosts', status })
  return (data ?? []) as BlogPost[]
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  
  handleSupabaseError(error, { action: 'getBlogPostBySlug', slug })
  return data as BlogPost
}

export async function createBlogPost(post: Partial<BlogPost>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'createBlogPost' })
  return data as BlogPost
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single()
  
  handleSupabaseError(error, { action: 'updateBlogPost', postId: id })
  return data as BlogPost
}

export async function deleteBlogPost(id: string, userId?: string) {
  const supabase = getSupabaseClient()
  const { data: post, error: fetchError } = await supabase
    .from('blog_posts')
    .select('images')
    .eq('id', id)
    .single()

  handleSupabaseError(fetchError, { action: 'deleteBlogPost', stage: 'fetch', postId: id, userId })

  let deleteQuery = supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
  
  if (userId) {
    deleteQuery = deleteQuery.eq('user_id', userId)
  }

  const { error } = await deleteQuery
  handleSupabaseError(error, { action: 'deleteBlogPost', stage: 'delete', postId: id, userId })

  if (post?.images && post.images.length > 0) {
    for (const url of post.images) {
      await deleteImage(url).catch(console.error)
    }
  }
}

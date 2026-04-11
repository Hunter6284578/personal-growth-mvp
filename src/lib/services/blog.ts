import { supabase } from '../supabase'
import { deleteImage } from '../upload'
import type { BlogPost } from '@/types'

export async function getBlogPosts(status?: 'draft' | 'published', limit = 50) {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data as BlogPost
}

export async function createBlogPost(post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()
  
  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as BlogPost
}

export async function deleteBlogPost(id: string) {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('images')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
  
  if (error) throw error

  if (post?.images && post.images.length > 0) {
    for (const url of post.images) {
      await deleteImage(url).catch(console.error)
    }
  }
}

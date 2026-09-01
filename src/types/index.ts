export interface BlogPost {
  id: string
  user_id: string
  title: string
  slug: string
  category: string | null
  summary: string | null
  content: string
  tags: string[] | null
  images: string[] | null
  status: 'draft' | 'published'
  view_count: number
  published_at: string | null
  created_at: string
  updated_at: string
}

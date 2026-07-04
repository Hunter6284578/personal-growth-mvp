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

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  author_email: string | null
  website: string | null
  content: string
  status: 'pending' | 'approved' | 'rejected'
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface GuestbookEntry {
  id: string
  author_name: string
  content: string
  entry_type: 'message' | 'check_in'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

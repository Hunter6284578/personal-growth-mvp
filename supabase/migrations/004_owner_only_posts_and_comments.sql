CREATE TABLE IF NOT EXISTS public.site_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own admin row" ON public.site_admins;
CREATE POLICY "Admins can view own admin row" ON public.site_admins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Site admins can manage posts" ON public.blog_posts;
CREATE POLICY "Site admins can manage posts" ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.site_admins
      WHERE site_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.site_admins
      WHERE site_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Site admins can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.site_admins
      WHERE site_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Site admins can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.site_admins
      WHERE site_admins.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  website TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT blog_comments_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT blog_comments_author_name_check CHECK (char_length(trim(author_name)) BETWEEN 1 AND 40),
  CONSTRAINT blog_comments_content_check CHECK (char_length(trim(content)) BETWEEN 1 AND 2000)
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status);

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;
CREATE POLICY "Anyone can view approved comments" ON public.blog_comments
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can submit pending comments" ON public.blog_comments;
CREATE POLICY "Anyone can submit pending comments" ON public.blog_comments
  FOR INSERT WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE blog_posts.id = post_id
      AND blog_posts.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Site admins can manage comments" ON public.blog_comments;
CREATE POLICY "Site admins can manage comments" ON public.blog_comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.site_admins
      WHERE site_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.site_admins
      WHERE site_admins.user_id = auth.uid()
    )
  );

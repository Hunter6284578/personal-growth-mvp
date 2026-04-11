-- 为 blog_posts 添加浏览量字段
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- 创建原子递增浏览量的 RPC 函数
CREATE OR REPLACE FUNCTION public.increment_post_view_count(post_slug TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE slug = post_slug AND status = 'published';
$$;

-- 设置已有文章的初始浏览量
UPDATE public.blog_posts
SET view_count = 0
WHERE view_count IS NULL;

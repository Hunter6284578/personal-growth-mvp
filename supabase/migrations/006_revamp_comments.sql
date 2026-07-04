-- 006_revamp_comments.sql
-- 评论系统改造：新增置顶字段、调整默认状态与 RLS 策略

-- 1. 给 blog_comments 表添加 is_pinned 字段（幂等）
ALTER TABLE public.blog_comments
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

-- 2. 修改 status 列默认值从 'pending' 改为 'approved'
ALTER TABLE public.blog_comments
  ALTER COLUMN status SET DEFAULT 'approved';

-- 3. 删除旧的 RLS INSERT 策略 "Anyone can submit pending comments"（幂等）
DROP POLICY IF EXISTS "Anyone can submit pending comments" ON public.blog_comments;

-- 4. 创建新的 RLS INSERT 策略，要求 status = 'approved' 且关联文章已发布
DROP POLICY IF EXISTS "Anyone can submit comments" ON public.blog_comments;
CREATE POLICY "Anyone can submit comments" ON public.blog_comments
  FOR INSERT WITH CHECK (
    status = 'approved' AND EXISTS(SELECT 1 FROM blog_posts WHERE id = post_id AND status = 'published')
  );

-- 5. 新增 admin-only UPDATE 策略（允许站主更新 is_pinned 等字段）
DROP POLICY IF EXISTS "Site admins can update comments" ON public.blog_comments;
CREATE POLICY "Site admins can update comments" ON public.blog_comments
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- 6. 将现有 pending 状态的评论批量更新为 approved
UPDATE public.blog_comments SET status = 'approved' WHERE status = 'pending';

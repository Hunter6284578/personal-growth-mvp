-- 1. 为 blog_posts 添加图片字段
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT NULL;

-- 2. 为 thoughts 添加图片字段
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT NULL;

-- 3. 为 life_events 添加图片字段
ALTER TABLE life_events ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT NULL;

-- 4. 创建 Storage Bucket 用于存放上传的图片 (如果不存在)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. 设置 Storage RLS 策略 (允许公开访问，允许已登录用户上传)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid() = owner);
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid() = owner);

-- Align public content tables and profile access with the current app code.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.thoughts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.blog_posts
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.thoughts
  ALTER COLUMN user_id SET DEFAULT auth.uid();

UPDATE public.blog_posts
SET user_id = COALESCE(
  user_id,
  (SELECT profiles.user_id FROM public.profiles ORDER BY profiles.created_at ASC LIMIT 1),
  (SELECT users.id FROM auth.users ORDER BY users.created_at ASC LIMIT 1)
)
WHERE user_id IS NULL;

UPDATE public.thoughts
SET user_id = COALESCE(
  user_id,
  (SELECT profiles.user_id FROM public.profiles ORDER BY profiles.created_at ASC LIMIT 1),
  (SELECT users.id FROM auth.users ORDER BY users.created_at ASC LIMIT 1)
)
WHERE user_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE user_id IS NULL) THEN
    ALTER TABLE public.blog_posts ALTER COLUMN user_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'blog_posts still contains rows without user_id; manual backfill is required before enforcing NOT NULL.';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.thoughts WHERE user_id IS NULL) THEN
    ALTER TABLE public.thoughts ALTER COLUMN user_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'thoughts still contains rows without user_id; manual backfill is required before enforcing NOT NULL.';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON public.thoughts(user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.blog_posts;

CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view own posts" ON public.blog_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.blog_posts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.blog_posts
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Public can view thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can view own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can insert own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can update own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can delete own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Authenticated users can manage thoughts" ON public.thoughts;

CREATE POLICY "Public can view thoughts" ON public.thoughts
  FOR SELECT USING (true);

CREATE POLICY "Users can view own thoughts" ON public.thoughts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thoughts" ON public.thoughts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts" ON public.thoughts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts" ON public.thoughts
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, character_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'character_name', '主角'))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (user_id, character_name)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data ->> 'character_name', '主角')
FROM auth.users AS users
LEFT JOIN public.profiles AS profiles ON profiles.user_id = users.id
WHERE profiles.id IS NULL;

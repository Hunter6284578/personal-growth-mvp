-- 007_page_views.sql
-- 网站访问统计：用 Supabase 存访问事件，前端用 Next.js API 写入并展示

-- 1. 页面浏览表（按天聚合：每篇文章/路径每天一行）
CREATE TABLE IF NOT EXISTS public.page_views (
  id          BIGSERIAL PRIMARY KEY,
  path        TEXT NOT NULL,             -- e.g. '/', '/blog/foo', '/about'
  view_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (path, view_date)
);

CREATE INDEX IF NOT EXISTS page_views_date_idx
  ON public.page_views (view_date DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx
  ON public.page_views (path);

-- 2. 原始访问事件表（保留明细，可用于后续做漏斗/分析）
CREATE TABLE IF NOT EXISTS public.page_view_events (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL,
  referrer   TEXT,
  user_agent TEXT,
  ip_hash    TEXT,             -- 存 IP 的 SHA256 前 16 字节（不存原始 IP，隐私）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_view_events_created_at_idx
  ON public.page_view_events (created_at DESC);
CREATE INDEX IF NOT EXISTS page_view_events_path_idx
  ON public.page_view_events (path);

-- 3. RLS：任何人可插入（公开的统计），但只有 admin 可读
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_view_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert page view events" ON public.page_view_events;
CREATE POLICY "Anyone can insert page view events" ON public.page_view_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Site admins can read page views" ON public.page_views;
CREATE POLICY "Site admins can read page views" ON public.page_views
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Site admins can read page view events" ON public.page_view_events;
CREATE POLICY "Site admins can read page view events" ON public.page_view_events
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- 4. RPC：原子地给某 path 在某 date +1（防止并发竞争）
CREATE OR REPLACE FUNCTION public.increment_page_view(
  p_path TEXT,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS void AS $$
BEGIN
  INSERT INTO public.page_views (path, view_date, view_count)
    VALUES (p_path, p_date, 1)
    ON CONFLICT (path, view_date)
    DO UPDATE SET view_count = page_views.view_count + 1,
                  updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC：查询某 path 在最近 N 天的总访问数
CREATE OR REPLACE FUNCTION public.get_page_view_count(
  p_path TEXT,
  p_days INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(view_count), 0)::INTEGER
  FROM public.page_views
  WHERE path = p_path
    AND view_date >= CURRENT_DATE - p_days;
$$ LANGUAGE sql STABLE;

-- 6. RPC：最近 30 天每日访问总数（用于 dashboard 折线图）
CREATE OR REPLACE FUNCTION public.get_daily_page_views(
  p_days INTEGER DEFAULT 30
) RETURNS TABLE(day DATE, total BIGINT) AS $$
  SELECT view_date, SUM(view_count)
  FROM public.page_views
  WHERE view_date >= CURRENT_DATE - p_days
  GROUP BY view_date
  ORDER BY view_date ASC;
$$ LANGUAGE sql STABLE;

-- 7. RPC：返回今天/昨天的访问总数（dashboard 摘要用）
CREATE OR REPLACE FUNCTION public.get_recent_two_days()
RETURNS TABLE(day DATE, total BIGINT) AS $$
  SELECT view_date, SUM(view_count)
  FROM public.page_views
  WHERE view_date >= CURRENT_DATE - 1
  GROUP BY view_date
  ORDER BY view_date DESC;
$$ LANGUAGE sql STABLE;

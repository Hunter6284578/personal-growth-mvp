CREATE TABLE IF NOT EXISTS public.guestbook_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'message',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT guestbook_entries_type_check CHECK (entry_type IN ('message', 'check_in')),
  CONSTRAINT guestbook_entries_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT guestbook_entries_author_name_check CHECK (char_length(trim(author_name)) BETWEEN 1 AND 40),
  CONSTRAINT guestbook_entries_content_check CHECK (char_length(trim(content)) BETWEEN 1 AND 500)
);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_status_created_at
  ON public.guestbook_entries(status, created_at DESC);

DROP TRIGGER IF EXISTS update_guestbook_entries_updated_at ON public.guestbook_entries;
CREATE TRIGGER update_guestbook_entries_updated_at
  BEFORE UPDATE ON public.guestbook_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Anyone can view approved guestbook entries" ON public.guestbook_entries
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can submit pending guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Anyone can submit pending guestbook entries" ON public.guestbook_entries
  FOR INSERT WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Site admins can manage guestbook entries" ON public.guestbook_entries;
CREATE POLICY "Site admins can manage guestbook entries" ON public.guestbook_entries
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

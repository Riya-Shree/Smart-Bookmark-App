-- =====================================================================
-- Markd — Smart Bookmark App: Supabase Schema
-- Run this entire file in your Supabase project's SQL Editor
-- =====================================================================

-- 1. Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Auto-update `updated_at` on row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookmarks_updated_at ON public.bookmarks;
CREATE TRIGGER trg_bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Indexes for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id
  ON public.bookmarks (user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at
  ON public.bookmarks (created_at DESC);

-- 4. Enable Row-Level Security
--    This is the PRIMARY security layer — users can ONLY touch their own rows.
--    Even direct API calls with the anon key cannot bypass RLS.
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running
DROP POLICY IF EXISTS "select_own"  ON public.bookmarks;
DROP POLICY IF EXISTS "insert_own"  ON public.bookmarks;
DROP POLICY IF EXISTS "delete_own"  ON public.bookmarks;
DROP POLICY IF EXISTS "update_own"  ON public.bookmarks;

-- SELECT: users see only their own bookmarks
CREATE POLICY "select_own" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: users can only insert rows with their own user_id
CREATE POLICY "insert_own" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: users can only delete their own bookmarks
CREATE POLICY "delete_own" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- UPDATE: users can only update their own bookmarks
CREATE POLICY "update_own" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Enable Realtime on the bookmarks table
--    This allows the client to subscribe to INSERT/UPDATE/DELETE events.
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;

-- =====================================================================
-- Done! ✅  Proceed to set up Google Auth in Supabase Dashboard.
-- =====================================================================

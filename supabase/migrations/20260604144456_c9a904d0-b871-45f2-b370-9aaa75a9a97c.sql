
CREATE TABLE IF NOT EXISTS public.checkin_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id uuid NOT NULL,
  user_id uuid NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkin_comments_checkin ON public.checkin_comments(checkin_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_comments TO authenticated;
GRANT ALL ON public.checkin_comments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_likes TO authenticated;
GRANT ALL ON public.checkin_likes TO service_role;

ALTER TABLE public.checkin_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view checkin comments" ON public.checkin_comments;
CREATE POLICY "Members can view checkin comments" ON public.checkin_comments
FOR SELECT TO authenticated USING (public.can_access_checkin(auth.uid(), checkin_id));

DROP POLICY IF EXISTS "Members can comment checkins" ON public.checkin_comments;
CREATE POLICY "Members can comment checkins" ON public.checkin_comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.can_access_checkin(auth.uid(), checkin_id));

DROP POLICY IF EXISTS "Users can delete own checkin comments" ON public.checkin_comments;
CREATE POLICY "Users can delete own checkin comments" ON public.checkin_comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

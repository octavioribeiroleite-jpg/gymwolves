
-- Helper function: check if user is member of the group that owns a checkin
CREATE OR REPLACE FUNCTION public.can_access_checkin(_user_id uuid, _checkin_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.checkins c
    JOIN public.group_members gm ON gm.group_id = c.group_id
    WHERE c.id = _checkin_id
      AND gm.user_id = _user_id
      AND gm.status = 'active'
  );
$$;

-- Likes
CREATE TABLE public.checkin_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (checkin_id, user_id)
);

CREATE INDEX idx_checkin_likes_checkin ON public.checkin_likes(checkin_id);
CREATE INDEX idx_checkin_likes_user ON public.checkin_likes(user_id);

ALTER TABLE public.checkin_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view checkin likes" ON public.checkin_likes
FOR SELECT USING (public.can_access_checkin(auth.uid(), checkin_id));

CREATE POLICY "Members can like checkins" ON public.checkin_likes
FOR INSERT WITH CHECK (auth.uid() = user_id AND public.can_access_checkin(auth.uid(), checkin_id));

CREATE POLICY "Users can unlike own" ON public.checkin_likes
FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.checkin_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id uuid NOT NULL,
  user_id uuid NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkin_comments_checkin ON public.checkin_comments(checkin_id);

ALTER TABLE public.checkin_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view checkin comments" ON public.checkin_comments
FOR SELECT USING (public.can_access_checkin(auth.uid(), checkin_id));

CREATE POLICY "Members can comment checkins" ON public.checkin_comments
FOR INSERT WITH CHECK (auth.uid() = user_id AND public.can_access_checkin(auth.uid(), checkin_id));

CREATE POLICY "Users can delete own checkin comments" ON public.checkin_comments
FOR DELETE USING (auth.uid() = user_id);

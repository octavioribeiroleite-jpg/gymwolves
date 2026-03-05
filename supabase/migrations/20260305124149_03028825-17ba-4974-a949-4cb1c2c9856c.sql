
-- =============================================
-- CHALLENGE SOCIAL TABLES
-- =============================================

-- 1. Challenge Posts (Feed)
CREATE TABLE public.challenge_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0
);

-- 2. Challenge Post Likes
CREATE TABLE public.challenge_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.challenge_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- 3. Challenge Post Comments
CREATE TABLE public.challenge_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.challenge_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Challenge Messages (Chat)
CREATE TABLE public.challenge_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- TRIGGERS FOR COUNTERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.challenge_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.challenge_post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.challenge_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_messages ENABLE ROW LEVEL SECURITY;

-- Posts
CREATE POLICY "Members can view posts" ON public.challenge_posts
FOR SELECT USING (is_group_member(auth.uid(), challenge_id));

CREATE POLICY "Members can create posts" ON public.challenge_posts
FOR INSERT WITH CHECK (auth.uid() = user_id AND is_group_member(auth.uid(), challenge_id));

CREATE POLICY "Users can delete own posts" ON public.challenge_posts
FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Members can view likes" ON public.challenge_post_likes
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.challenge_posts p WHERE p.id = post_id AND is_group_member(auth.uid(), p.challenge_id)
));

CREATE POLICY "Members can like posts" ON public.challenge_post_likes
FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.challenge_posts p WHERE p.id = post_id AND is_group_member(auth.uid(), p.challenge_id)
));

CREATE POLICY "Users can unlike" ON public.challenge_post_likes
FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Members can view comments" ON public.challenge_post_comments
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.challenge_posts p WHERE p.id = post_id AND is_group_member(auth.uid(), p.challenge_id)
));

CREATE POLICY "Members can comment" ON public.challenge_post_comments
FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.challenge_posts p WHERE p.id = post_id AND is_group_member(auth.uid(), p.challenge_id)
));

CREATE POLICY "Users can delete own comments" ON public.challenge_post_comments
FOR DELETE USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Members can view messages" ON public.challenge_messages
FOR SELECT USING (is_group_member(auth.uid(), challenge_id));

CREATE POLICY "Members can send messages" ON public.challenge_messages
FOR INSERT WITH CHECK (auth.uid() = user_id AND is_group_member(auth.uid(), challenge_id));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_messages;

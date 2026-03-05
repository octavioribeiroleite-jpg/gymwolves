
-- Make group_id nullable since challenges can now be standalone
ALTER TABLE public.challenges ALTER COLUMN group_id DROP NOT NULL;

-- Add new columns to challenges
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS invite_code text NOT NULL DEFAULT substring(md5(random()::text), 1, 8);
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Challenge participants table
CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Challenge invites table
CREATE TABLE public.challenge_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  expires_at timestamptz,
  max_uses integer DEFAULT 10,
  uses_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenge_invites ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.is_challenge_participant(_user_id uuid, _challenge_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE user_id = _user_id AND challenge_id = _challenge_id AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_challenge_owner(_user_id uuid, _challenge_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE user_id = _user_id AND challenge_id = _challenge_id AND role = 'owner' AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.find_challenge_by_code(_code text)
RETURNS TABLE(id uuid, name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.name FROM public.challenges c WHERE c.invite_code = _code AND c.status = 'active';
$$;

-- RLS for challenge_participants
CREATE POLICY "View participants" ON public.challenge_participants
  FOR SELECT TO authenticated USING (is_challenge_participant(auth.uid(), challenge_id));
CREATE POLICY "Join challenge" ON public.challenge_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leave or remove" ON public.challenge_participants
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_challenge_owner(auth.uid(), challenge_id));

-- RLS for challenge_invites
CREATE POLICY "View invites" ON public.challenge_invites
  FOR SELECT TO authenticated USING (is_challenge_participant(auth.uid(), challenge_id));
CREATE POLICY "Create invites" ON public.challenge_invites
  FOR INSERT TO authenticated WITH CHECK (is_challenge_owner(auth.uid(), challenge_id));

-- Update challenges RLS to support standalone challenges
DROP POLICY IF EXISTS "Members can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Members can view challenges" ON public.challenges;
CREATE POLICY "View challenges" ON public.challenges
  FOR SELECT TO authenticated USING (is_challenge_participant(auth.uid(), id) OR created_by = auth.uid());
CREATE POLICY "Create challenges" ON public.challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner can update challenges" ON public.challenges
  FOR UPDATE TO authenticated USING (is_challenge_owner(auth.uid(), id));

-- Update workout_logs RLS to use challenge_participant
DROP POLICY IF EXISTS "Challenge members can view logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can log own workouts" ON public.workout_logs;
CREATE POLICY "Participants can view logs" ON public.workout_logs
  FOR SELECT TO authenticated USING (is_challenge_participant(auth.uid(), challenge_id));
CREATE POLICY "Participants can log workouts" ON public.workout_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_challenge_participant(auth.uid(), challenge_id));

-- Ensure unique workout per day per user per challenge
CREATE UNIQUE INDEX IF NOT EXISTS unique_workout_per_day ON public.workout_logs(challenge_id, user_id, workout_date);

-- Enable realtime for challenge_participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;

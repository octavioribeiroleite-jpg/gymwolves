
-- Add new columns to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'challenge';
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS scoring_mode text NOT NULL DEFAULT 'days_active';
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS goal_total integer NOT NULL DEFAULT 200;

-- Add role to group_members
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

-- Create checkins table
CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Treino',
  note text,
  proof_type text NOT NULL DEFAULT 'manual',
  proof_url text,
  duration_min integer,
  distance_km numeric,
  steps integer,
  calories integer,
  checkin_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- RLS for checkins
CREATE POLICY "Members can view group checkins" ON public.checkins
  FOR SELECT TO authenticated USING (is_group_member(auth.uid(), group_id));
CREATE POLICY "Members can create checkins" ON public.checkins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_group_member(auth.uid(), group_id));
CREATE POLICY "Users can delete own checkins" ON public.checkins
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for checkins
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;

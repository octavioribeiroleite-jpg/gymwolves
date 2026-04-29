-- Add status column with CHECK constraint
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'finished'));

-- Backfill: mark already-expired challenges as finished
UPDATE public.groups
   SET status = 'finished'
 WHERE type = 'challenge'
   AND end_date IS NOT NULL
   AND end_date < CURRENT_DATE;

-- Partial index to speed up active-list filters
CREATE INDEX IF NOT EXISTS idx_groups_status_active
  ON public.groups (status)
  WHERE status = 'active';
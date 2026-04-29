-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function that finalizes expired challenges
CREATE OR REPLACE FUNCTION public.finalize_expired_groups()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.groups
     SET status = 'finished'
   WHERE status = 'active'
     AND type = 'challenge'
     AND end_date IS NOT NULL
     AND end_date < CURRENT_DATE;
$$;

-- Restrict execution: only the cron/postgres role should call it
REVOKE EXECUTE ON FUNCTION public.finalize_expired_groups() FROM PUBLIC, anon, authenticated;

-- Unschedule any previous version, then schedule hourly
DO $$
BEGIN
  PERFORM cron.unschedule('finalize-expired-groups')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'finalize-expired-groups');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'finalize-expired-groups',
  '0 * * * *',
  $$ SELECT public.finalize_expired_groups(); $$
);
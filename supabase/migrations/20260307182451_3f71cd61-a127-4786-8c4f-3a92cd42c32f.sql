-- Enable leaked password protection (HIBP check)
-- This is done via auth config, not SQL. Adding a no-op migration as placeholder.
-- The actual HIBP setting needs to be enabled via the auth configuration.
SELECT 1;
-- Make checkin-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'checkin-photos';

-- Drop existing public SELECT policy if any and create authenticated-only policy
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read access" ON storage.objects;

CREATE POLICY "Authenticated read access"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'checkin-photos');
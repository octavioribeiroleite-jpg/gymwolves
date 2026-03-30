
UPDATE storage.buckets SET public = true WHERE id = 'checkin-photos';

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkin-photos');

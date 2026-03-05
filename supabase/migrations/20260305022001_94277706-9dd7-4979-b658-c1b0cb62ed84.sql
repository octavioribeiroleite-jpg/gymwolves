-- Create storage bucket for checkin photos
INSERT INTO storage.buckets (id, name, public) VALUES ('checkin-photos', 'checkin-photos', true);

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload checkin photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Public can view checkin photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'checkin-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'checkin-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add workout_type column to checkins
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS workout_type text NOT NULL DEFAULT 'musculacao';

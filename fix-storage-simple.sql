-- Simple storage RLS policy fix
-- Run this in your Supabase SQL Editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own audio files" ON storage.objects;

-- Create new policies for the audio bucket
CREATE POLICY "Allow authenticated users to upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to read audio files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own audio files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Also allow DELETE for cleanup
CREATE POLICY "Allow users to delete their own audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

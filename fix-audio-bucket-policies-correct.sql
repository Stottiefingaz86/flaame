-- Fix audio bucket policies to allow beat uploads (same as battles)
-- This will make beats work exactly like battles do

-- Drop existing restrictive policies (if they exist)
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files 1jgvrq_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;

-- Create simple INSERT policy (no folder restrictions)
CREATE POLICY "Allow authenticated uploads to audio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio' 
        AND auth.role() = 'authenticated'
    );

-- Create simple SELECT policy (public read access)
CREATE POLICY "Allow public read from audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'audio');

-- Create simple UPDATE policy (users can update their own files)
CREATE POLICY "Allow users to update own audio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create simple DELETE policy (users can delete their own files)
CREATE POLICY "Allow users to delete own audio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

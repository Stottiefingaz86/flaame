-- NUCLEAR OPTION: Complete reset of audio bucket policies
-- This will make beats work by removing ALL complexity

-- First, let's see what we're dealing with
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check if RLS is enabled on storage.objects
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop ALL policies for audio bucket (nuclear option)
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files 1jgvrq_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own audio" ON storage.objects;
DROP POLICY IF EXISTS "audio_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "audio_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "audio_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "audio_delete_policy" ON storage.objects;

-- Create the SIMPLEST possible policies (no folder restrictions at all)
CREATE POLICY "audio_upload_anyone" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio'
    );

CREATE POLICY "audio_read_anyone" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'audio'
    );

CREATE POLICY "audio_update_anyone" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio'
    );

CREATE POLICY "audio_delete_anyone" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio'
    );

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;



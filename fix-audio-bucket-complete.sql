-- COMPLETE FIX for audio bucket policies
-- This will make beats work exactly like battles

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Drop ALL existing policies for the audio bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files 1jgvrq_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own audio" ON storage.objects;

-- Create completely new, simple policies
CREATE POLICY "audio_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "audio_select_policy" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'audio'
    );

CREATE POLICY "audio_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "audio_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;



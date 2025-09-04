-- Create dedicated beats bucket with simple policies
-- This follows the same pattern as the working battle-audio bucket

-- Create the beats bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'beats', 
  'beats', 
  true, 
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg']
);

-- Simple policies for beats bucket (no complex folder restrictions)

-- Allow anyone to read beats (public access)
CREATE POLICY "Public read access for beats" ON storage.objects
    FOR SELECT USING (bucket_id = 'beats');

-- Allow authenticated users to upload beats (simple check)
CREATE POLICY "Authenticated users can upload beats" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'beats' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their own beats
CREATE POLICY "Users can update own beats" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'beats' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own beats
CREATE POLICY "Users can delete own beats" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'beats' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'beats';

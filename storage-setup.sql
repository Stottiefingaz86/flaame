-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('beats', 'beats', true, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg']),
  ('battle-audio', 'battle-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- RLS Policies for beats bucket
CREATE POLICY "Anyone can view beats" ON storage.objects
  FOR SELECT USING (bucket_id = 'beats');

CREATE POLICY "Authenticated users can upload beats" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'beats' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own beats" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'beats' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own beats" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'beats' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for battle-audio bucket
CREATE POLICY "Anyone can view battle audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'battle-audio');

CREATE POLICY "Authenticated users can upload battle audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'battle-audio' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own battle audio" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'battle-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own battle audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'battle-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


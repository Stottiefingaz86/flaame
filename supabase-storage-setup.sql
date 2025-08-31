-- Supabase Storage Setup for Flaame
-- This file sets up storage buckets and policies for audio files, avatars, and media

-- Create storage buckets
-- Note: These need to be created via Supabase Dashboard or Storage API
-- This is a reference for what needs to be created

-- 1. AUDIO BUCKET (for beats and battle audio)
-- Bucket name: 'audio'
-- Public bucket: true
-- File size limit: 50MB
-- Allowed MIME types: audio/*

-- 2. AVATARS BUCKET (for user profile pictures)
-- Bucket name: 'avatars'
-- Public bucket: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- 3. BATTLE_AUDIO BUCKET (for battle submissions)
-- Bucket name: 'battle-audio'
-- Public bucket: true
-- File size limit: 25MB
-- Allowed MIME types: audio/*

-- 4. WAVEFORMS BUCKET (for audio waveform data)
-- Bucket name: 'waveforms'
-- Public bucket: true
-- File size limit: 1MB
-- Allowed MIME types: application/json, image/*

-- Storage Policies for 'audio' bucket
-- Allow public read access to all audio files
CREATE POLICY "Public read access for audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'audio');

-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to update their own audio files
CREATE POLICY "Users can update own audio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own audio files
CREATE POLICY "Users can delete own audio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage Policies for 'avatars' bucket
-- Allow public read access to all avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage Policies for 'battle-audio' bucket
-- Allow public read access to battle audio
CREATE POLICY "Public read access for battle audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'battle-audio');

-- Allow authenticated users to upload battle audio
CREATE POLICY "Authenticated users can upload battle audio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'battle-audio' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to update their own battle audio
CREATE POLICY "Users can update own battle audio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'battle-audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own battle audio
CREATE POLICY "Users can delete own battle audio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'battle-audio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage Policies for 'waveforms' bucket
-- Allow public read access to waveforms
CREATE POLICY "Public read access for waveforms" ON storage.objects
    FOR SELECT USING (bucket_id = 'waveforms');

-- Allow authenticated users to upload waveforms
CREATE POLICY "Authenticated users can upload waveforms" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'waveforms' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to update their own waveforms
CREATE POLICY "Users can update own waveforms" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'waveforms' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own waveforms
CREATE POLICY "Users can delete own waveforms" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'waveforms' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Helper function to get public URL for storage objects
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to generate unique file names
CREATE OR REPLACE FUNCTION generate_unique_filename(user_id UUID, original_filename TEXT, extension TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN user_id::text || '/' || extract(epoch from now())::bigint || '_' || encode(gen_random_bytes(8), 'hex') || '.' || extension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update beats table to include proper file paths
ALTER TABLE beats ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS waveform_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

-- Update battle_entries table to include proper file paths
ALTER TABLE battle_entries ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE battle_entries ADD COLUMN IF NOT EXISTS waveform_url TEXT;
ALTER TABLE battle_entries ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

-- Update profiles table to include avatar URL
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Function to handle beat upload
CREATE OR REPLACE FUNCTION handle_beat_upload(
    p_title TEXT,
    p_description TEXT,
    p_genre TEXT,
    p_bpm INTEGER,
    p_key TEXT,
    p_is_free BOOLEAN,
    p_price INTEGER,
    p_file_path TEXT,
    p_file_size BIGINT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    beat_id UUID;
    public_url TEXT;
BEGIN
    -- Generate public URL
    public_url := get_storage_url('audio', p_file_path);
    
    -- Insert beat record
    INSERT INTO beats (
        title,
        artist,
        description,
        genre,
        bpm,
        key,
        is_free,
        cost_flames,
        file_path,
        audio_url,
        file_size_bytes,
        uploader_id
    ) VALUES (
        p_title,
        (SELECT username FROM profiles WHERE id = p_user_id),
        p_description,
        p_genre,
        p_bpm,
        p_key,
        p_is_free,
        CASE WHEN p_is_free THEN 0 ELSE p_price END,
        p_file_path,
        public_url,
        p_file_size,
        p_user_id
    ) RETURNING id INTO beat_id;
    
    RETURN beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle battle audio upload
CREATE OR REPLACE FUNCTION handle_battle_audio_upload(
    p_battle_id UUID,
    p_user_id UUID,
    p_file_path TEXT,
    p_file_size BIGINT,
    p_lyrics TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    entry_id UUID;
    public_url TEXT;
BEGIN
    -- Generate public URL
    public_url := get_storage_url('battle-audio', p_file_path);
    
    -- Insert or update battle entry
    INSERT INTO battle_entries (
        battle_id,
        user_id,
        audio_file_path,
        audio_url,
        file_size_bytes,
        lyrics
    ) VALUES (
        p_battle_id,
        p_user_id,
        p_file_path,
        public_url,
        p_file_size,
        p_lyrics
    ) 
    ON CONFLICT (battle_id, user_id) 
    DO UPDATE SET
        audio_file_path = EXCLUDED.audio_file_path,
        audio_url = EXCLUDED.audio_url,
        file_size_bytes = EXCLUDED.file_size_bytes,
        lyrics = EXCLUDED.lyrics,
        updated_at = NOW()
    RETURNING id INTO entry_id;
    
    RETURN entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle avatar upload
CREATE OR REPLACE FUNCTION handle_avatar_upload(
    p_user_id UUID,
    p_file_path TEXT
)
RETURNS TEXT AS $$
DECLARE
    public_url TEXT;
BEGIN
    -- Generate public URL
    public_url := get_storage_url('avatars', p_file_path);
    
    -- Update user profile
    UPDATE profiles 
    SET avatar_url = public_url, updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN public_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

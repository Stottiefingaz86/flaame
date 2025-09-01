-- Add missing columns to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS waveform_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 180;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS producer_id UUID REFERENCES profiles(id);

-- Update storage bucket to allow larger files
-- Note: This needs to be done in Supabase dashboard manually
-- Go to Storage > Settings > File size limit and increase to 50MB

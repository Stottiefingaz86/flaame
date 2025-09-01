-- Fix beats table to ensure all columns exist for upload functionality

-- Add missing columns to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS producer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE beats ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT true;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS copyright_verified BOOLEAN DEFAULT false;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'beats' 
ORDER BY column_name;

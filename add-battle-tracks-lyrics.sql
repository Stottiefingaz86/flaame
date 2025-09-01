-- Add battle track and lyrics columns to battles table
-- This enables storing challenger and opponent tracks and lyrics

-- Add challenger track column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_track TEXT;

-- Add opponent track column  
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_track TEXT;

-- Add challenger lyrics column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_lyrics TEXT;

-- Add opponent lyrics column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_lyrics TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'battles' 
AND column_name IN ('challenger_track', 'opponent_track', 'challenger_lyrics', 'opponent_lyrics');

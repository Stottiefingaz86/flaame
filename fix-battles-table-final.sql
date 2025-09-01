-- Final fix for battles table to ensure battle creation works
-- Run this in your Supabase SQL Editor

-- First, let's check what columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'battles'
ORDER BY column_name;

-- Add any missing columns
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS beat_id UUID REFERENCES beats(id) ON DELETE SET NULL;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS status battle_status DEFAULT 'pending';
ALTER TABLE battles ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 days');
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_votes INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_votes INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_track TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_track TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_lyrics TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_lyrics TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create or update RLS policies
DROP POLICY IF EXISTS "Users can view battles" ON battles;
DROP POLICY IF EXISTS "Users can create battles" ON battles;
DROP POLICY IF EXISTS "Users can update own battles" ON battles;

CREATE POLICY "Users can view battles" ON battles FOR SELECT USING (true);
CREATE POLICY "Users can create battles" ON battles FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update own battles" ON battles FOR UPDATE USING (auth.uid() = challenger_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_battles_challenger_id ON battles(challenger_id);
CREATE INDEX IF NOT EXISTS idx_battles_opponent_id ON battles(opponent_id);
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_ends_at ON battles(ends_at);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'battles'
ORDER BY column_name;

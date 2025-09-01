-- Add missing columns to battles table
-- This will fix the battle creation issue

-- Add challenger_id column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add opponent_id column  
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add beat_id column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS beat_id UUID REFERENCES beats(id) ON DELETE SET NULL;

-- Add status column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS status battle_status DEFAULT 'pending';

-- Add ends_at column
ALTER TABLE battles ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 days');

-- Add vote columns
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_votes INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_votes INTEGER DEFAULT 0;

-- Create the policies
DROP POLICY IF EXISTS "Users can view own created battles" ON battles;
DROP POLICY IF EXISTS "Users can create battles" ON battles;
DROP POLICY IF EXISTS "Users can update own battles" ON battles;

CREATE POLICY "Users can view own created battles" ON battles FOR SELECT USING (auth.uid() = challenger_id);
CREATE POLICY "Users can create battles" ON battles FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update own battles" ON battles FOR UPDATE USING (auth.uid() = challenger_id);

-- Create index
DROP INDEX IF EXISTS idx_battles_creator;
CREATE INDEX idx_battles_creator ON battles(challenger_id);

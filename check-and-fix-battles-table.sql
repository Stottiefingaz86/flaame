-- Check current battles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'battles' 
ORDER BY ordinal_position;

-- If challenger_id doesn't exist, we need to add it
-- First, let's see what columns exist and then add the missing ones

-- Add challenger_id column if it doesn't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add opponent_id column if it doesn't exist  
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add beat_id column if it doesn't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS beat_id UUID REFERENCES beats(id) ON DELETE SET NULL;

-- Add status column if it doesn't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS status battle_status DEFAULT 'pending';

-- Add ends_at column if it doesn't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 days');

-- Add vote columns if they don't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_votes INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_votes INTEGER DEFAULT 0;

-- Now create the policies with the correct column names
DROP POLICY IF EXISTS "Users can view own created battles" ON battles;
DROP POLICY IF EXISTS "Users can create battles" ON battles;
DROP POLICY IF EXISTS "Users can update own battles" ON battles;

-- Recreate policies with correct column names
CREATE POLICY "Users can view own created battles" ON battles FOR SELECT USING (auth.uid() = challenger_id);
CREATE POLICY "Users can create battles" ON battles FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update own battles" ON battles FOR UPDATE USING (auth.uid() = challenger_id);

-- Create index
DROP INDEX IF EXISTS idx_battles_creator;
CREATE INDEX idx_battles_creator ON battles(challenger_id);

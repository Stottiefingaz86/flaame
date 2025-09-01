-- Fix battle creation issues
-- Update RLS policies to use challenger_id instead of creator_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own created battles" ON battles;
DROP POLICY IF EXISTS "Users can create battles" ON battles;
DROP POLICY IF EXISTS "Users can update own battles" ON battles;

-- Recreate policies with correct column names
CREATE POLICY "Users can view own created battles" ON battles FOR SELECT USING (auth.uid() = challenger_id);
CREATE POLICY "Users can create battles" ON battles FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update own battles" ON battles FOR UPDATE USING (auth.uid() = challenger_id);

-- Update index to use correct column
DROP INDEX IF EXISTS idx_battles_creator;
CREATE INDEX idx_battles_creator ON battles(challenger_id);

-- Setup battle likes functionality
-- This will enable the like button on battle pages

-- Create battle_likes table to track who liked which battles
CREATE TABLE IF NOT EXISTS battle_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(battle_id, user_id) -- Prevent duplicate likes
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_battle_likes_battle_id ON battle_likes(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_likes_user_id ON battle_likes(user_id);

-- Add like_count column to battles table for performance
ALTER TABLE battles ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE battle_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all battle likes" ON battle_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like battles" ON battle_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON battle_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update battle like count
CREATE OR REPLACE FUNCTION update_battle_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE battles 
    SET like_count = like_count + 1 
    WHERE id = NEW.battle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE battles 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.battle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like count
DROP TRIGGER IF EXISTS trigger_update_battle_like_count ON battle_likes;
CREATE TRIGGER trigger_update_battle_like_count
  AFTER INSERT OR DELETE ON battle_likes
  FOR EACH ROW EXECUTE FUNCTION update_battle_like_count();



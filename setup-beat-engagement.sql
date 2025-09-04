image.pngbeat used should not be on the waiting, as nothing as been uploaded,-- Setup tables for beat engagement features (likes and flaame gifting)
-- This will enable the "Leading Producer" feature on the home page

-- Add league column to battles table if it doesn't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS league VARCHAR(20) DEFAULT 'ukus' CHECK (league IN ('ukus', 'spanish', 'german', 'philippines'));

-- Create beat_engagement table for likes and flaame gifting
CREATE TABLE IF NOT EXISTS beat_engagement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    engagement_type VARCHAR(20) NOT NULL CHECK (engagement_type IN ('like', 'flame_gift')),
    flame_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(beat_id, user_id, engagement_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beat_engagement_beat_id ON beat_engagement(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_engagement_user_id ON beat_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_beat_engagement_type ON beat_engagement(engagement_type);

-- Enable RLS
ALTER TABLE beat_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all beat engagements" ON beat_engagement
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own beat engagements" ON beat_engagement
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beat engagements" ON beat_engagement
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beat engagements" ON beat_engagement
    FOR DELETE USING (auth.uid() = user_id);

-- Create beat_likes table to track who liked which beats
CREATE TABLE IF NOT EXISTS beat_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(beat_id, user_id) -- Prevent duplicate likes
);

-- Create beat_gifts table to track flaame gifts
CREATE TABLE IF NOT EXISTS beat_gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  gifter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flaames INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beat_likes_beat_id ON beat_likes(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_likes_user_id ON beat_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_beat_gifts_beat_id ON beat_gifts(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_gifts_recipient_id ON beat_gifts(recipient_id);

-- Enable RLS on new tables
ALTER TABLE beat_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_gifts ENABLE ROW LEVEL SECURITY;

-- Create policies for beat_likes
CREATE POLICY "Users can like beats" ON beat_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all likes" ON beat_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can unlike their own likes" ON beat_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for beat_gifts
CREATE POLICY "Users can gift flaames" ON beat_gifts
  FOR INSERT WITH CHECK (auth.uid() = gifter_id);

CREATE POLICY "Users can view all gifts" ON beat_gifts
  FOR SELECT USING (true);

-- Add like_count and gift_count columns to beats table for performance
ALTER TABLE beats ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS gift_count INTEGER DEFAULT 0;

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_beat_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE beats SET like_count = like_count + 1 WHERE id = NEW.beat_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE beats SET like_count = like_count - 1 WHERE id = OLD.beat_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update gift count
CREATE OR REPLACE FUNCTION update_beat_gift_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE beats SET gift_count = gift_count + 1 WHERE id = NEW.beat_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER trigger_update_beat_like_count
  AFTER INSERT OR DELETE ON beat_likes
  FOR EACH ROW EXECUTE FUNCTION update_beat_like_count();

CREATE TRIGGER trigger_update_beat_gift_count
  AFTER INSERT ON beat_gifts
  FOR EACH ROW EXECUTE FUNCTION update_beat_gift_count();

-- Verify the setup
SELECT 'beat_likes' as table_name, COUNT(*) as record_count FROM beat_likes
UNION ALL
SELECT 'beat_gifts' as table_name, COUNT(*) as record_count FROM beat_gifts;

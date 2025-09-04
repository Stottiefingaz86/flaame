-- Create beat_purchases table to track premium beat transactions
CREATE TABLE IF NOT EXISTS beat_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cost_flames INTEGER NOT NULL CHECK (cost_flames > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only purchase a beat once
  UNIQUE(beat_id, buyer_id)
);

-- Add flaame_balance column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'flaame_balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN flaame_balance INTEGER DEFAULT 100;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_beat_purchases_beat_id ON beat_purchases(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_purchases_buyer_id ON beat_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_beat_purchases_producer_id ON beat_purchases(producer_id);

-- Enable RLS on beat_purchases table
ALTER TABLE beat_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for beat_purchases
CREATE POLICY "Users can view their own purchases" ON beat_purchases
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can insert their own purchases" ON beat_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Grant necessary permissions
GRANT ALL ON beat_purchases TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

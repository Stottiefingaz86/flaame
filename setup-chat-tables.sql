-- Setup Chat System Tables
-- Run this in your Supabase SQL Editor

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    emoji_id UUID REFERENCES emojis(id) ON DELETE SET NULL,
    message_type TEXT DEFAULT 'message', -- 'message', 'battle_challenge', 'system', 'emoji'
    battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create battle_challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS battle_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
    stakes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emojis table if it doesn't exist
CREATE TABLE IF NOT EXISTS emojis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emoji TEXT NOT NULL,
    name TEXT NOT NULL,
    cost INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_emojis table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_emojis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    emoji_id UUID REFERENCES emojis(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, emoji_id)
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE emojis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emojis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_messages
CREATE POLICY "Anyone can read chat messages" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for battle_challenges
CREATE POLICY "Users can read their own challenges" ON battle_challenges
    FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE POLICY "Authenticated users can create challenges" ON battle_challenges
    FOR INSERT WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their own challenges" ON battle_challenges
    FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Create RLS policies for emojis
CREATE POLICY "Anyone can read emojis" ON emojis
    FOR SELECT USING (true);

-- Create RLS policies for user_emojis
CREATE POLICY "Users can read their own emojis" ON user_emojis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emojis" ON user_emojis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some default emojis
INSERT INTO emojis (emoji, name, cost, rarity) VALUES
('🔥', 'Fire', 0, 'common'),
('💯', 'Hundred', 0, 'common'),
('🎤', 'Microphone', 0, 'common'),
('👑', 'Crown', 0, 'common'),
('⚡', 'Lightning', 0, 'common'),
('💎', 'Diamond', 50, 'rare'),
('🏆', 'Trophy', 100, 'epic'),
('👑', 'Golden Crown', 200, 'legendary'),
('🔥', 'Super Fire', 150, 'epic'),
('💀', 'Skull', 75, 'rare')
ON CONFLICT DO NOTHING;

-- Create a function to spend flames
CREATE OR REPLACE FUNCTION spend_flames(
    user_uuid UUID,
    amount INTEGER,
    reason TEXT,
    reference_id UUID DEFAULT NULL,
    reference_type TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Check if user has enough flames
    IF (SELECT flames FROM profiles WHERE id = user_uuid) < amount THEN
        RAISE EXCEPTION 'Insufficient flames';
    END IF;
    
    -- Deduct flames
    UPDATE profiles 
    SET flames = flames - amount 
    WHERE id = user_uuid;
    
    -- Log transaction
    INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type)
    VALUES (user_uuid, -amount, 'spend', reason, reference_id, reference_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION spend_flames TO authenticated;

-- Flaame Database Schema
-- Complete setup for production-ready hip-hop battle platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE battle_status AS ENUM ('pending', 'active', 'closed', 'cancelled');
CREATE TYPE battle_result AS ENUM ('win', 'loss', 'draw');
CREATE TYPE beat_license_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE emoji_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE user_rank AS ENUM ('Newcomer', 'Rising', 'Veteran', 'Legendary');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    instagram_id TEXT UNIQUE,
    instagram_username TEXT,
    account_type TEXT,
    media_count INTEGER DEFAULT 0,
    flames INTEGER DEFAULT 100,
    rank user_rank DEFAULT 'Newcomer',
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_id UUID,
    profile_color TEXT DEFAULT '#ff6b35',
    profile_icon TEXT DEFAULT '🔥',
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beats table (for beat marketplace)
CREATE TABLE beats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    description TEXT,
    duration INTEGER, -- in seconds
    bpm INTEGER,
    key TEXT,
    genre TEXT,
    cost_flames INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    is_original BOOLEAN DEFAULT TRUE,
    copyright_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    file_path TEXT,
    file_size INTEGER,
    uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beat licenses table
CREATE TABLE beat_licenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status beat_license_status DEFAULT 'active',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(beat_id, user_id)
);

-- Battles table
CREATE TABLE battles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
    challenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    stakes INTEGER DEFAULT 0,
    status battle_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 days'),
    challenger_votes INTEGER DEFAULT 0,
    opponent_votes INTEGER DEFAULT 0,
    challenger_lyrics TEXT,
    opponent_lyrics TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle entries table
CREATE TABLE battle_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    audio_file_path TEXT,
    lyrics TEXT,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, user_id)
);

-- Votes table
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES battle_entries(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, voter_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avatars table (for customization)
CREATE TABLE avatars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_path TEXT,
    cost_flames INTEGER DEFAULT 0,
    rarity emoji_rarity DEFAULT 'common',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User inventory table
CREATE TABLE user_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_equipped BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, avatar_id)
);

-- Emojis table (for chat)
CREATE TABLE emojis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emoji TEXT NOT NULL,
    name TEXT NOT NULL,
    cost INTEGER DEFAULT 0,
    rarity emoji_rarity DEFAULT 'common',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User emojis table
CREATE TABLE user_emojis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    emoji_id UUID REFERENCES emojis(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, emoji_id)
);

-- Transactions table (for flame economy)
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'earn', 'spend', 'purchase', 'refund'
    description TEXT,
    reference_id UUID, -- battle_id, beat_id, etc.
    reference_type TEXT, -- 'battle', 'beat', 'avatar', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors table
CREATE TABLE sponsors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_path TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle sponsors table
CREATE TABLE battle_sponsors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
    slot TEXT NOT NULL, -- 'hero', 'sidebar', 'footer'
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    emoji_id UUID REFERENCES emojis(id) ON DELETE SET NULL,
    message_type TEXT DEFAULT 'message', -- 'message', 'battle_challenge', 'system', 'emoji'
    battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle challenges table
CREATE TABLE battle_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
    stakes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copyright verification table
CREATE TABLE copyright_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_instagram_id ON profiles(instagram_id);
CREATE INDEX idx_beats_uploader ON beats(uploader_id);
CREATE INDEX idx_beats_free ON beats(is_free);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_creator ON battles(creator_id);
CREATE INDEX idx_battle_entries_battle ON battle_entries(battle_id);
CREATE INDEX idx_votes_battle ON votes(battle_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
CREATE INDEX idx_comments_battle ON comments(battle_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beats_updated_at BEFORE UPDATE ON beats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_battles_updated_at BEFORE UPDATE ON battles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_battle_entries_updated_at BEFORE UPDATE ON battle_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user rank based on points
CREATE OR REPLACE FUNCTION calculate_user_rank(user_points INTEGER)
RETURNS user_rank AS $$
BEGIN
    IF user_points >= 1000 THEN
        RETURN 'Legendary';
    ELSIF user_points >= 500 THEN
        RETURN 'Veteran';
    ELSIF user_points >= 100 THEN
        RETURN 'Rising';
    ELSE
        RETURN 'Newcomer';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update user rank
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate points from battle results
    WITH user_points AS (
        SELECT 
            be.user_id,
            COUNT(CASE WHEN be.vote_count > (SELECT AVG(vote_count) FROM battle_entries WHERE battle_id = be.battle_id) THEN 1 END) * 3 +
            COUNT(CASE WHEN be.vote_count = (SELECT AVG(vote_count) FROM battle_entries WHERE battle_id = be.battle_id) THEN 1 END) * 1 as total_points
        FROM battle_entries be
        WHERE be.user_id = NEW.user_id
        GROUP BY be.user_id
    )
    UPDATE profiles 
    SET rank = calculate_user_rank(COALESCE(up.total_points, 0))
    FROM user_points up
    WHERE profiles.id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rank when battle entries are updated
CREATE TRIGGER update_rank_on_battle_entry
    AFTER INSERT OR UPDATE ON battle_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rank();

-- Function to grant flames
CREATE OR REPLACE FUNCTION grant_flames(user_uuid UUID, amount INTEGER, reason TEXT, reference_id UUID DEFAULT NULL, reference_type TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update user's flame balance
    UPDATE profiles 
    SET flames = flames + amount 
    WHERE id = user_uuid;
    
    -- Log transaction
    INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type)
    VALUES (user_uuid, amount, 'earn', reason, reference_id, reference_type);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to spend flames
CREATE OR REPLACE FUNCTION spend_flames(user_uuid UUID, amount INTEGER, reason TEXT, reference_id UUID DEFAULT NULL, reference_type TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    current_flames INTEGER;
BEGIN
    -- Check current balance
    SELECT flames INTO current_flames FROM profiles WHERE id = user_uuid;
    
    IF current_flames < amount THEN
        RETURN FALSE;
    END IF;
    
    -- Update user's flame balance
    UPDATE profiles 
    SET flames = flames - amount 
    WHERE id = user_uuid;
    
    -- Log transaction
    INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type)
    VALUES (user_uuid, -amount, 'spend', reason, reference_id, reference_type);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE emojis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emojis ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Beats policies
CREATE POLICY "Anyone can view available beats" ON beats FOR SELECT USING (is_available = true);
CREATE POLICY "Users can view own uploaded beats" ON beats FOR SELECT USING (auth.uid() = uploader_id);
CREATE POLICY "Users can upload beats" ON beats FOR INSERT WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "Users can update own beats" ON beats FOR UPDATE USING (auth.uid() = uploader_id);
CREATE POLICY "Admins can manage all beats" ON beats FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rank = 'Legendary'));

-- Beat licenses policies
CREATE POLICY "Users can view own licenses" ON beat_licenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase licenses" ON beat_licenses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Battles policies
CREATE POLICY "Anyone can view active battles" ON battles FOR SELECT USING (status IN ('active', 'closed'));
CREATE POLICY "Users can view own created battles" ON battles FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can create battles" ON battles FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own battles" ON battles FOR UPDATE USING (auth.uid() = creator_id);

-- Battle entries policies
CREATE POLICY "Anyone can view battle entries" ON battle_entries FOR SELECT USING (true);
CREATE POLICY "Users can create own entries" ON battle_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON battle_entries FOR UPDATE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can vote once per battle" ON votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can comment after voting" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Avatars policies
CREATE POLICY "Anyone can view available avatars" ON avatars FOR SELECT USING (is_available = true);
CREATE POLICY "Users can view own inventory" ON user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase avatars" ON user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emojis policies
CREATE POLICY "Anyone can view available emojis" ON emojis FOR SELECT USING (is_available = true);
CREATE POLICY "Users can view own emojis" ON user_emojis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase emojis" ON user_emojis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Battle challenges policies
CREATE POLICY "Users can view challenges" ON battle_challenges FOR SELECT USING (auth.uid() IN (challenger_id, opponent_id));
CREATE POLICY "Users can create challenges" ON battle_challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can respond to challenges" ON battle_challenges FOR UPDATE USING (auth.uid() = opponent_id);

-- Copyright verification policies
CREATE POLICY "Admins can manage copyright verifications" ON copyright_verifications FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rank = 'Legendary'));

-- Insert sample data
INSERT INTO avatars (name, description, cost_flames, rarity) VALUES
('Default Flame', 'Basic flame avatar', 0, 'common'),
('Golden Crown', 'Royal crown avatar', 500, 'epic'),
('Diamond Skull', 'Precious skull avatar', 1000, 'legendary'),
('Silver Mic', 'Professional microphone', 250, 'rare'),
('Neon Glow', 'Glowing neon effect', 750, 'epic');

INSERT INTO emojis (emoji, name, cost, rarity) VALUES
('🔥', 'Fire', 0, 'common'),
('⚡', 'Lightning', 0, 'common'),
('💎', 'Diamond', 50, 'rare'),
('👑', 'Crown', 100, 'epic'),
('🚀', 'Rocket', 200, 'legendary'),
('🎯', 'Target', 75, 'rare'),
('💪', 'Muscle', 25, 'common'),
('🎵', 'Music', 150, 'epic');

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, flames, rank)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
        100,
        'Newcomer'
    );
    
    -- Grant free emojis
    INSERT INTO user_emojis (user_id, emoji_id)
    SELECT NEW.id, id FROM emojis WHERE cost = 0;
    
    -- Grant default avatar
    INSERT INTO user_inventory (user_id, avatar_id, is_equipped)
    SELECT NEW.id, id, true FROM avatars WHERE cost_flames = 0 LIMIT 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    flag_emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default leagues
INSERT INTO leagues (name, country, language, flag_emoji) VALUES
('US/UK League', 'United States & United Kingdom', 'English', '🇺🇸🇬🇧'),
('Spanish League', 'Spain & Latin America', 'Spanish', '🇪🇸'),
('Philippines League', 'Philippines', 'Filipino/English', '🇵🇭'),
('German League', 'Germany', 'German', '🇩🇪'),
('French League', 'France', 'French', '🇫🇷');

-- Add league_id to battles table (without DEFAULT)
ALTER TABLE battles ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id);

-- Add league_id to profiles table (without DEFAULT)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_league_id UUID REFERENCES leagues(id);

-- Enable RLS for leagues
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active leagues" ON leagues FOR SELECT USING (is_active = true);

-- Update handle_new_user function to set default league
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_league_id UUID;
BEGIN
    -- Get the default league ID
    SELECT id INTO default_league_id FROM leagues WHERE name = 'US/UK League' LIMIT 1;
    
    INSERT INTO profiles (id, username, flames, rank, preferred_league_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
        100,
        'Newcomer',
        default_league_id
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

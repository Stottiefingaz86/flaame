-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a simpler handle_new_user function without leagues dependency
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing profiles to have a default league
UPDATE profiles 
SET preferred_league_id = (SELECT id FROM leagues WHERE name = 'US/UK League' LIMIT 1)
WHERE preferred_league_id IS NULL;


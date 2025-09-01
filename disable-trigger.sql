-- Disable the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well
DROP FUNCTION IF EXISTS handle_new_user();

-- Add a simple function for manual profile creation (optional)
CREATE OR REPLACE FUNCTION create_user_profile(user_id UUID, display_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Insert profile
    INSERT INTO profiles (id, username, flames, rank)
    VALUES (user_id, display_name, 100, 'Newcomer');
    
    -- Grant free emojis
    INSERT INTO user_emojis (user_id, emoji_id)
    SELECT user_id, id FROM emojis WHERE cost = 0;
    
    -- Grant default avatar
    INSERT INTO user_inventory (user_id, avatar_id, is_equipped)
    SELECT user_id, id, true FROM avatars WHERE cost_flames = 0 LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

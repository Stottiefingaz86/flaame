-- Update flame system: reduce initial flames and add daily login rewards
-- Run this in your Supabase SQL Editor

-- 1. Update existing users to have 5 flames instead of 100 (if they have 100)
UPDATE profiles 
SET flames = 5 
WHERE flames = 100;

-- 2. Add daily login reward tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0;

-- 3. Add flames_gifted column to battles table if it doesn't exist
ALTER TABLE battles ADD COLUMN IF NOT EXISTS flames_gifted INTEGER DEFAULT 0;

-- 4. Create a function to handle daily login rewards
CREATE OR REPLACE FUNCTION handle_daily_login_reward(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    last_login DATE;
    consecutive_days INTEGER;
    reward_flames INTEGER;
BEGIN
    -- Get user's last login info
    SELECT last_login_date, consecutive_login_days 
    INTO last_login, consecutive_days 
    FROM profiles 
    WHERE id = user_id;
    
    -- If first time logging in or new day
    IF last_login IS NULL OR last_login < current_date THEN
        -- If consecutive login (not first time)
        IF last_login IS NOT NULL AND last_login = current_date - INTERVAL '1 day' THEN
            consecutive_days := consecutive_days + 1;
        ELSE
            consecutive_days := 1;
        END IF;
        
        -- Calculate reward (1 flame per day, bonus for consecutive days)
        reward_flames := 1;
        IF consecutive_days >= 7 THEN
            reward_flames := reward_flames + 1; -- Bonus flame for 7+ consecutive days
        END IF;
        IF consecutive_days >= 30 THEN
            reward_flames := reward_flames + 2; -- Bonus 2 flames for 30+ consecutive days
        END IF;
        
        -- Update user's flames and login info
        UPDATE profiles 
        SET 
            flames = flames + reward_flames,
            last_login_date = current_date,
            consecutive_login_days = consecutive_days
        WHERE id = user_id;
        
        RETURN reward_flames;
    ELSE
        -- Already logged in today
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a trigger to automatically handle daily login rewards
-- This will be called when a user logs in (you'll need to call it from your app)
-- Example usage: SELECT handle_daily_login_reward('user-uuid-here');

-- 6. Update the default value for new users (this affects future signups)
-- You'll need to update your signup logic to set initial flames to 5 instead of 100

COMMENT ON FUNCTION handle_daily_login_reward IS 'Handles daily login rewards for users. Returns the number of flames awarded. Call this function when a user logs in.';


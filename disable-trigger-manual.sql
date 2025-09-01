-- Copy and paste this into your Supabase SQL Editor to disable the problematic trigger

-- Drop the trigger that's causing account creation to fail
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well
DROP FUNCTION IF EXISTS handle_new_user();

-- Verify the trigger is gone
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

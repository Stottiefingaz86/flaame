-- Fix avatar upload issue
-- The avatar_id column is currently UUID type but we need to store filenames (TEXT)

-- Change the avatar_id column from UUID to TEXT to allow filenames
ALTER TABLE profiles ALTER COLUMN avatar_id TYPE TEXT;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'avatar_id';

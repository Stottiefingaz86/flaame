-- Fix avatar_id column type to allow filenames instead of UUIDs
ALTER TABLE profiles ALTER COLUMN avatar_id TYPE TEXT;

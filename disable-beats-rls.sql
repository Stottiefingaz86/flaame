-- TEMPORARILY DISABLE RLS on beats table to test if policies are the issue
-- This will allow any authenticated user to insert/update/delete beats

-- First, let's see the current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'beats';

-- Disable RLS on the beats table
ALTER TABLE beats DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'beats';

-- Now try uploading a beat - it should work without any policy restrictions



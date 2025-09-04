-- Fix beats table RLS policies to allow users to insert beat records
-- This will make the database insert work after successful file upload

-- First, let's see what policies exist for the beats table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'beats';

-- Check if RLS is enabled on the beats table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'beats';

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own beats" ON beats;
DROP POLICY IF EXISTS "Users can view all beats" ON beats;
DROP POLICY IF EXISTS "Users can update their own beats" ON beats;
DROP POLICY IF EXISTS "Users can delete their own beats" ON beats;

-- Create simple policies for the beats table
CREATE POLICY "beats_insert_policy" ON beats
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

CREATE POLICY "beats_select_policy" ON beats
    FOR SELECT USING (
        true  -- Anyone can view beats
    );

CREATE POLICY "beats_update_policy" ON beats
    FOR UPDATE USING (
        auth.uid() = producer_id  -- Users can only update their own beats
    );

CREATE POLICY "beats_delete_policy" ON beats
    FOR DELETE USING (
        auth.uid() = producer_id  -- Users can only delete their own beats
    );

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'beats'
ORDER BY policyname;



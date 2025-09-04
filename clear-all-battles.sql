-- Clear all battles from the database
-- This will remove all battle records so you can start fresh

-- First, let's see how many battles exist
SELECT COUNT(*) as total_battles FROM battles;

-- Remove all battles
DELETE FROM battles;

-- Verify all battles are removed
SELECT COUNT(*) as remaining_battles FROM battles;

-- Reset any auto-incrementing sequences if they exist
-- (This is usually not needed for UUID primary keys, but included for completeness)
-- SELECT setval('battles_id_seq', 1, false); -- Only if you have a sequence

-- Show the result
SELECT 'All battles have been cleared successfully!' as status;


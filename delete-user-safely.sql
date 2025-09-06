-- Safe User Deletion Script
-- Replace 'USER_EMAIL_HERE' with the actual email of the user you want to delete

-- First, find the user ID
-- SELECT id, email FROM auth.users WHERE email = 'USER_EMAIL_HERE';

-- Replace 'USER_UUID_HERE' with the actual UUID from the query above
-- Then run these deletions in order:

-- 1. Delete user's votes
DELETE FROM votes WHERE voter_id = 'USER_UUID_HERE';

-- 2. Delete user's comments
DELETE FROM comments WHERE user_id = 'USER_UUID_HERE';

-- 3. Delete user's battle entries
DELETE FROM battle_entries WHERE user_id = 'USER_UUID_HERE';

-- 4. Delete user's chat messages
DELETE FROM chat_messages WHERE user_id = 'USER_UUID_HERE';

-- 5. Delete user's transactions
DELETE FROM transactions WHERE user_id = 'USER_UUID_HERE';

-- 6. Delete user's customizations
DELETE FROM user_customizations WHERE user_id = 'USER_UUID_HERE';

-- 7. Delete user's equipped items
DELETE FROM equipped_items WHERE user_id = 'USER_UUID_HERE';

-- 8. Delete user's inventory
DELETE FROM user_inventory WHERE user_id = 'USER_UUID_HERE';

-- 9. Delete user's emojis
DELETE FROM user_emojis WHERE user_id = 'USER_UUID_HERE';

-- 10. Delete user's beat licenses
DELETE FROM beat_licenses WHERE user_id = 'USER_UUID_HERE';

-- 11. Update battles to remove user as challenger/opponent (set to NULL)
UPDATE battles SET challenger_id = NULL WHERE challenger_id = 'USER_UUID_HERE';
UPDATE battles SET opponent_id = NULL WHERE opponent_id = 'USER_UUID_HERE';

-- 12. Update beats to remove user as uploader (set to NULL)
UPDATE beats SET uploader_id = NULL WHERE uploader_id = 'USER_UUID_HERE';

-- 13. Finally, delete the profile (this will cascade to auth.users)
DELETE FROM profiles WHERE id = 'USER_UUID_HERE';

-- The auth.users record will be automatically deleted due to the CASCADE constraint

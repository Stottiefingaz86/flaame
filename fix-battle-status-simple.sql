-- Simple fix for battle_status enum - add 'challenge' status
-- This must be run in a committed transaction

-- Step 1: Add the new enum value
ALTER TYPE battle_status ADD VALUE IF NOT EXISTS 'challenge';

-- Step 2: Commit the transaction (this is the key step)
COMMIT;

-- Step 3: Verify the enum now includes 'challenge'
SELECT unnest(enum_range(NULL::battle_status)) as valid_status_values;

-- Step 4: Show current battles and their statuses
SELECT id, title, status, created_at 
FROM battles 
ORDER BY created_at DESC 
LIMIT 5;


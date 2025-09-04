-- Fix battle_status enum to include 'challenge' status
-- This is required for the new battle flow: pending -> challenge -> active -> closed

-- First, let's check the current enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'battle_status'
);

-- Add the new 'challenge' status to the enum
ALTER TYPE battle_status ADD VALUE IF NOT EXISTS 'challenge';

-- Verify the enum now includes 'challenge'
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'battle_status'
);

-- Update any existing battles that might have invalid status
-- (This shouldn't affect existing data, just ensures the enum is updated)
UPDATE battles 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'challenge', 'active', 'closed', 'cancelled');

-- Show the final enum values
SELECT unnest(enum_range(NULL::battle_status)) as valid_status_values;

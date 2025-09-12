-- Add voted_for column to votes table to support direct challenger/opponent voting
-- This allows the votes table to work with both entry-based voting and direct voting

ALTER TABLE votes 
ADD COLUMN voted_for UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update the unique constraint to allow one vote per user per battle
-- (either for an entry or directly for a user)
ALTER TABLE votes 
DROP CONSTRAINT IF EXISTS votes_battle_id_voter_id_key;

-- Add a new constraint that allows one vote per user per battle
-- but allows either entry_id OR voted_for to be set (not both)
ALTER TABLE votes 
ADD CONSTRAINT votes_battle_id_voter_id_unique 
UNIQUE (battle_id, voter_id);

-- Add a check constraint to ensure either entry_id OR voted_for is set, but not both
ALTER TABLE votes 
ADD CONSTRAINT votes_entry_or_user_check 
CHECK (
  (entry_id IS NOT NULL AND voted_for IS NULL) OR 
  (entry_id IS NULL AND voted_for IS NOT NULL)
);

-- Battle System Setup
-- Complete voting, completion, and flame rewards system

-- Create votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    voted_for UUID REFERENCES profiles(id) ON DELETE CASCADE, -- challenger_id or opponent_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, voter_id) -- One vote per user per battle
);

-- Create battle_flames table for flame gifting
CREATE TABLE IF NOT EXISTS battle_flames (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    gifter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add winner_id column to battles table
ALTER TABLE battles ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create function to complete a battle and award flames
CREATE OR REPLACE FUNCTION complete_battle(battle_uuid UUID)
RETURNS VOID AS $$
DECLARE
    battle_record RECORD;
    challenger_flames INTEGER;
    opponent_flames INTEGER;
    total_gifted_flames INTEGER;
BEGIN
    -- Get battle details
    SELECT * INTO battle_record 
    FROM battles 
    WHERE id = battle_uuid AND status IN ('active', 'pending');
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Battle not found or already completed';
    END IF;
    
    -- Calculate total gifted flames for this battle
    SELECT COALESCE(SUM(amount), 0) INTO total_gifted_flames
    FROM battle_flames 
    WHERE battle_id = battle_uuid;
    
    -- Determine winner and award flames
    IF battle_record.challenger_votes > battle_record.opponent_votes THEN
        -- Challenger wins
        UPDATE battles 
        SET winner_id = battle_record.challenger_id, 
            status = 'closed',
            completed_at = NOW()
        WHERE id = battle_uuid;
        
        -- Award flames: winner gets 5 + all gifted flames, loser gets 1
        UPDATE profiles 
        SET flames = flames + 5 + total_gifted_flames
        WHERE id = battle_record.challenger_id;
        
        IF battle_record.opponent_id IS NOT NULL THEN
            UPDATE profiles 
            SET flames = flames + 1
            WHERE id = battle_record.opponent_id;
        END IF;
        
    ELSIF battle_record.opponent_votes > battle_record.challenger_votes THEN
        -- Opponent wins
        UPDATE battles 
        SET winner_id = battle_record.opponent_id, 
            status = 'closed',
            completed_at = NOW()
        WHERE id = battle_uuid;
        
        -- Award flames: winner gets 5 + all gifted flames, loser gets 1
        UPDATE profiles 
        SET flames = flames + 5 + total_gifted_flames
        WHERE id = battle_record.opponent_id;
        
        UPDATE profiles 
        SET flames = flames + 1
        WHERE id = battle_record.challenger_id;
        
    ELSE
        -- Draw - both get 1 flame + split gifted flames
        UPDATE battles 
        SET winner_id = NULL, 
            status = 'closed',
            completed_at = NOW()
        WHERE id = battle_uuid;
        
        -- Award flames: both get 1 + half of gifted flames
        UPDATE profiles 
        SET flames = flames + 1 + (total_gifted_flames / 2)
        WHERE id = battle_record.challenger_id;
        
        IF battle_record.opponent_id IS NOT NULL THEN
            UPDATE profiles 
            SET flames = flames + 1 + (total_gifted_flames / 2)
            WHERE id = battle_record.opponent_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to check and complete expired battles
CREATE OR REPLACE FUNCTION check_expired_battles()
RETURNS VOID AS $$
DECLARE
    expired_battle RECORD;
BEGIN
    -- Find battles that have ended but are still active
    FOR expired_battle IN 
        SELECT id FROM battles 
        WHERE status IN ('active', 'pending') 
        AND ends_at <= NOW()
    LOOP
        PERFORM complete_battle(expired_battle.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes" ON votes
FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON votes
FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Create RLS policies for battle_flames table
ALTER TABLE battle_flames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view battle flames" ON battle_flames
FOR SELECT USING (true);

CREATE POLICY "Users can gift flames" ON battle_flames
FOR INSERT WITH CHECK (auth.uid() = gifter_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_battle_id ON votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_battle_flames_battle_id ON battle_flames(battle_id);
CREATE INDEX IF NOT EXISTS idx_battles_ends_at ON battles(ends_at) WHERE status IN ('active', 'pending');

-- Create a trigger to automatically check for expired battles
CREATE OR REPLACE FUNCTION trigger_check_expired_battles()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM check_expired_battles();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs every time a vote is added
CREATE TRIGGER check_expired_battles_trigger
    AFTER INSERT ON votes
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_check_expired_battles();

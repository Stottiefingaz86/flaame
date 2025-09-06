-- Create a function to complete a battle in a single transaction
-- This will update the battle status, award flames, and update user stats all at once

CREATE OR REPLACE FUNCTION complete_battle_transaction(
  battle_id UUID,
  winner_id UUID DEFAULT NULL,
  flame_reward INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  battle_record RECORD;
  result JSON;
BEGIN
  -- Get battle details
  SELECT * INTO battle_record 
  FROM battles 
  WHERE id = battle_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Battle not found');
  END IF;
  
  -- Update battle status
  UPDATE battles 
  SET 
    status = 'closed',
    winner_id = winner_id,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = battle_id;
  
  -- Award flames to winner if there is one
  IF winner_id IS NOT NULL AND flame_reward > 0 THEN
    UPDATE profiles 
    SET 
      flames = flames + flame_reward,
      updated_at = NOW()
    WHERE id = winner_id;
    
    -- Log the flame transaction
    INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type, created_at)
    VALUES (winner_id, flame_reward, 'earn', 'Battle victory reward', battle_id, 'battle', NOW());
  END IF;
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'battle_id', battle_id,
    'winner_id', winner_id,
    'flames_awarded', flame_reward,
    'challenger_votes', battle_record.challenger_votes,
    'opponent_votes', battle_record.opponent_votes
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    RETURN json_build_object(
      'error', SQLERRM,
      'success', false
    );
END;
$$ LANGUAGE plpgsql;


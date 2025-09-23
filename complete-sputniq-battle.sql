-- STEP 1: Find the battle ID ✅ COMPLETED
-- Battle found: d54f1f20-6d06-4cde-8300-14f37da793b9
-- Votes: stottiefingaz (4) vs Sputniq (6) - Sputniq wins!

-- STEP 2A: Create the battle completion function first
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
    winner_id = complete_battle_transaction.winner_id,
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
    
    -- Log the flame transaction (if transactions table exists)
    BEGIN
      INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type, created_at)
      VALUES (winner_id, flame_reward, 'earn', 'Battle victory reward', battle_id, 'battle', NOW());
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignore if transactions table doesn't exist
        NULL;
    END;
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

-- STEP 2B: Complete the battle and award 3 points to Sputniq
-- Run this after creating the function above:
SELECT complete_battle_transaction(
  'd54f1f20-6d06-4cde-8300-14f37da793b9'::uuid,
  (
    SELECT CASE 
      WHEN opponent_votes > challenger_votes THEN opponent_id
      WHEN challenger_votes > opponent_votes THEN challenger_id
      ELSE NULL
    END
    FROM battles 
    WHERE id = 'd54f1f20-6d06-4cde-8300-14f37da793b9'::uuid
  ),
  3  -- Award 3 leaderboard points to winner
);

-- STEP 3: Verify the battle was completed and points awarded
-- Run this to confirm everything worked:
SELECT 
  b.id,
  b.status,
  b.winner_id,
  b.challenger_votes,
  b.opponent_votes,
  winner.username as winner_name,
  winner.flames as winner_points
FROM battles b
LEFT JOIN profiles winner ON b.winner_id = winner.id
WHERE b.id = 'd54f1f20-6d06-4cde-8300-14f37da793b9'::uuid;

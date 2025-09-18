const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBattle() {
  try {
    // Get the battle that should be closed
    const { data: battles, error } = await supabase
      .from('battles')
      .select('id, status, ends_at, challenger_votes, opponent_votes, winner_id, completed_at, challenger_id, opponent_id')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Recent battles:');
    battles.forEach(battle => {
      const timeLeft = new Date(battle.ends_at) - new Date();
      console.log({
        id: battle.id.substring(0, 8),
        status: battle.status,
        votes: `${battle.challenger_votes} vs ${battle.opponent_votes}`,
        winner_id: battle.winner_id ? battle.winner_id.substring(0, 8) : null,
        timeLeft: timeLeft > 0 ? 'Active' : 'Expired',
        completed_at: battle.completed_at
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBattle();

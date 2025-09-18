const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBattleCompletion() {
  try {
    console.log('🔍 Checking for expired battles...');
    
    // Get battles that have ended but aren't marked as closed
    const { data: expiredBattles, error } = await supabase
      .from('battles')
      .select('id, status, ends_at, challenger_votes, opponent_votes, challenger_id, opponent_id')
      .neq('status', 'closed')
      .lt('ends_at', new Date().toISOString());
      
    if (error) {
      console.error('❌ Error fetching battles:', error);
      return;
    }
    
    if (!expiredBattles || expiredBattles.length === 0) {
      console.log('✅ No expired battles found');
      return;
    }
    
    console.log(`📋 Found ${expiredBattles.length} expired battle(s) to complete:`);
    
    for (const battle of expiredBattles) {
      console.log(`\n🏆 Processing battle ${battle.id.substring(0, 8)}:`);
      console.log(`   Status: ${battle.status}`);
      console.log(`   Votes: ${battle.challenger_votes} vs ${battle.opponent_votes}`);
      
      // Determine winner
      let winnerId = null;
      let winnerType = 'tie';
      
      if (battle.challenger_votes > battle.opponent_votes) {
        winnerId = battle.challenger_id;
        winnerType = 'challenger';
      } else if (battle.opponent_votes > battle.challenger_votes) {
        winnerId = battle.opponent_id;
        winnerType = 'opponent';
      }
      
      console.log(`   Winner: ${winnerType} (${winnerId ? winnerId.substring(0, 8) : 'none'})`);
      
      // Complete the battle using the database function
      const { data: result, error: completeError } = await supabase.rpc('complete_battle_transaction', {
        battle_id: battle.id,
        winner_id: winnerId,
        flame_reward: winnerId ? 3 : 0
      });
      
      if (completeError) {
        console.error(`   ❌ Error completing battle: ${completeError.message}`);
        continue;
      }
      
      if (result && result.success) {
        console.log(`   ✅ Battle completed successfully`);
        console.log(`   🔥 Flames awarded: ${result.flames_awarded || 0}`);
      } else {
        console.log(`   ⚠️  Battle completion result: ${JSON.stringify(result)}`);
      }
    }
    
    console.log('\n🎉 Battle completion process finished!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the fix
fixBattleCompletion();

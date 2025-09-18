// Manual script to complete the Sputniq vs stottiefingaz battle
// Run this with: NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node complete-sputniq-battle.js

const { createClient } = require('@supabase/supabase-js');

async function completeBattle() {
  // Replace these with your actual values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('\nUsage:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node complete-sputniq-battle.js');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔍 Looking for stottiefingaz vs Sputniq battle...');
    
    // Find the battle between stottiefingaz and Sputniq
    const { data: battles, error: fetchError } = await supabase
      .from('battles')
      .select(`
        id, 
        status, 
        challenger_votes, 
        opponent_votes, 
        challenger_id,
        opponent_id,
        ends_at,
        challenger:profiles!battles_challenger_id_fkey(username),
        opponent:profiles!battles_opponent_id_fkey(username)
      `)
      .or('challenger.username.eq.stottiefingaz,opponent.username.eq.stottiefingaz')
      .or('challenger.username.eq.Sputniq,opponent.username.eq.Sputniq')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (fetchError) {
      console.error('❌ Error fetching battles:', fetchError);
      return;
    }
    
    // Find the specific battle
    const targetBattle = battles?.find(battle => 
      (battle.challenger?.username === 'stottiefingaz' && battle.opponent?.username === 'Sputniq') ||
      (battle.challenger?.username === 'Sputniq' && battle.opponent?.username === 'stottiefingaz')
    );
    
    if (!targetBattle) {
      console.log('❌ Could not find battle between stottiefingaz and Sputniq');
      console.log('Available battles:');
      battles?.forEach(battle => {
        console.log(`  - ${battle.challenger?.username} vs ${battle.opponent?.username} (${battle.challenger_votes} vs ${battle.opponent_votes})`);
      });
      return;
    }
    
    console.log(`\n🏆 Found battle: ${targetBattle.challenger?.username} vs ${targetBattle.opponent?.username}`);
    console.log(`   Battle ID: ${targetBattle.id}`);
    console.log(`   Current status: ${targetBattle.status}`);
    console.log(`   Votes: ${targetBattle.challenger_votes} vs ${targetBattle.opponent_votes}`);
    
    // Determine winner (Sputniq should have won with 6 votes vs 4)
    let winnerId = null;
    let winnerName = null;
    
    if (targetBattle.challenger_votes > targetBattle.opponent_votes) {
      winnerId = targetBattle.challenger_id;
      winnerName = targetBattle.challenger?.username;
    } else if (targetBattle.opponent_votes > targetBattle.challenger_votes) {
      winnerId = targetBattle.opponent_id;
      winnerName = targetBattle.opponent?.username;
    }
    
    console.log(`   Winner: ${winnerName} (${winnerId ? winnerId.substring(0, 8) : 'none'})`);
    
    if (winnerName !== 'Sputniq') {
      console.log('⚠️  Expected Sputniq to be the winner based on vote count');
    }
    
    // Complete the battle
    console.log('\n🚀 Completing battle...');
    
    const { data: result, error: completeError } = await supabase.rpc('complete_battle_transaction', {
      battle_id: targetBattle.id,
      winner_id: winnerId,
      flame_reward: winnerId ? 3 : 0
    });
    
    if (completeError) {
      console.error(`❌ Error completing battle: ${completeError.message}`);
      return;
    }
    
    if (result && result.success) {
      console.log(`✅ Battle completed successfully!`);
      console.log(`🔥 Flames awarded to ${winnerName}: 3`);
      console.log(`📊 Final votes: ${result.challenger_votes} vs ${result.opponent_votes}`);
      
      // Verify the user's flame count
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, flames')
        .eq('id', winnerId)
        .single();
        
      if (profile) {
        console.log(`💰 ${profile.username} now has ${profile.flames} flames total`);
      }
    } else {
      console.log(`⚠️  Battle completion result: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

completeBattle();

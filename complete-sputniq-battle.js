// Manual script to complete the Sputniq vs stottiefingaz battle and award leaderboard points
// Run this with: NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node complete-sputniq-battle.js

const { createClient } = require('@supabase/supabase-js');

async function completeBattle() {
  // Replace these with your actual values from Supabase dashboard
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('\nUsage:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node complete-sputniq-battle.js');
    console.log('\nGet these values from your Supabase project dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings > API');
    console.log('4. Copy the URL and service_role key');
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
        winner_id,
        challenger:profiles!battles_challenger_id_fkey(username, flames),
        opponent:profiles!battles_opponent_id_fkey(username, flames)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (fetchError) {
      console.error('❌ Error fetching battles:', fetchError);
      return;
    }
    
    console.log('\n📋 Recent battles found:');
    battles?.forEach((battle, index) => {
      console.log(`${index + 1}. ${battle.challenger?.username} vs ${battle.opponent?.username || 'Waiting...'}`);
      console.log(`   Status: ${battle.status} | Votes: ${battle.challenger_votes} vs ${battle.opponent_votes}`);
      console.log(`   ID: ${battle.id.substring(0, 8)}`);
    });
    
    // Find the specific battle
    const targetBattle = battles?.find(battle => 
      (battle.challenger?.username === 'stottiefingaz' && battle.opponent?.username === 'Sputniq') ||
      (battle.challenger?.username === 'Sputniq' && battle.opponent?.username === 'stottiefingaz')
    );
    
    if (!targetBattle) {
      console.log('\n❌ Could not find battle between stottiefingaz and Sputniq');
      return;
    }
    
    console.log(`\n🏆 Found target battle:`);
    console.log(`   ${targetBattle.challenger?.username} vs ${targetBattle.opponent?.username}`);
    console.log(`   Battle ID: ${targetBattle.id}`);
    console.log(`   Current status: ${targetBattle.status}`);
    console.log(`   Votes: ${targetBattle.challenger_votes} vs ${targetBattle.opponent_votes}`);
    console.log(`   Current winner_id: ${targetBattle.winner_id || 'none'}`);
    
    // Check if battle has already been completed
    if (targetBattle.status === 'closed' && targetBattle.winner_id) {
      console.log('✅ Battle is already completed!');
      
      // Check current leaderboard points
      const winnerId = targetBattle.winner_id;
      const { data: winnerProfile } = await supabase
        .from('profiles')
        .select('username, flames')
        .eq('id', winnerId)
        .single();
        
      if (winnerProfile) {
        console.log(`🏆 Winner: ${winnerProfile.username}`);
        console.log(`📊 Current leaderboard points: ${winnerProfile.flames}`);
      }
      return;
    }
    
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
    
    console.log(`\n🎯 Calculated winner: ${winnerName} (${winnerId ? winnerId.substring(0, 8) : 'none'})`);
    
    if (winnerName !== 'Sputniq') {
      console.log('⚠️  Expected Sputniq to be the winner based on vote count');
      console.log('   Proceeding anyway with calculated winner...');
    }
    
    // Get current leaderboard points before completion
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('username, flames')
      .eq('id', winnerId)
      .single();
      
    const pointsBefore = currentProfile?.flames || 0;
    console.log(`📊 ${winnerName}'s points before: ${pointsBefore}`);
    
    // Complete the battle using the database function
    console.log('\n🚀 Completing battle and awarding leaderboard points...');
    
    const { data: result, error: completeError } = await supabase.rpc('complete_battle_transaction', {
      battle_id: targetBattle.id,
      winner_id: winnerId,
      flame_reward: winnerId ? 3 : 0  // Award 3 points for winning
    });
    
    if (completeError) {
      console.error(`❌ Error completing battle: ${completeError.message}`);
      return;
    }
    
    if (result && result.success) {
      console.log(`✅ Battle completed successfully!`);
      console.log(`🏆 Winner: ${winnerName}`);
      console.log(`📊 Final votes: ${result.challenger_votes} vs ${result.opponent_votes}`);
      console.log(`🎖️  Leaderboard points awarded: 3`);
      
      // Verify the user's updated point count
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('username, flames')
        .eq('id', winnerId)
        .single();
        
      if (updatedProfile) {
        const pointsAfter = updatedProfile.flames;
        const pointsGained = pointsAfter - pointsBefore;
        console.log(`📈 ${updatedProfile.username}'s leaderboard points:`);
        console.log(`   Before: ${pointsBefore}`);
        console.log(`   After: ${pointsAfter}`);
        console.log(`   Gained: +${pointsGained}`);
      }
      
      console.log('\n🎉 Battle completion and point award successful!');
    } else {
      console.log(`⚠️  Battle completion result: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

console.log('🎮 Flaame Battle Completion Script');
console.log('==================================');
completeBattle();

// Test script to check battle creation issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBattleCreation() {
  try {
    console.log('Testing battle creation functionality...')
    
    // Check if beats table exists and has data
    const { data: beats, error: beatsError } = await supabase
      .from('beats')
      .select('*')
      .limit(5)
    
    if (beatsError) {
      console.error('❌ Error querying beats table:', beatsError)
      return
    }
    
    console.log('✅ Beats table accessible')
    console.log('Number of beats:', beats?.length || 0)
    console.log('Sample beats:', beats)
    
    // Check if battles table exists
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .limit(1)
    
    if (battlesError) {
      console.error('❌ Error querying battles table:', battlesError)
      return
    }
    
    console.log('✅ Battles table accessible')
    console.log('Number of battles:', battles?.length || 0)
    
    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Error querying profiles table:', profilesError)
      return
    }
    
    console.log('✅ Profiles table accessible')
    console.log('Number of profiles:', profiles?.length || 0)
    
    // Test battle creation with mock data
    if (beats && beats.length > 0 && profiles && profiles.length > 0) {
      console.log('\n🧪 Testing battle creation...')
      
      const testBattleData = {
        title: 'Test Battle',
        challenger_id: profiles[0].id,
        opponent_id: null,
        beat_id: beats[0].id,
        status: 'pending',
        created_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      const { data: newBattle, error: createError } = await supabase
        .from('battles')
        .insert([testBattleData])
        .select()
      
      if (createError) {
        console.error('❌ Error creating battle:', createError)
      } else {
        console.log('✅ Battle created successfully:', newBattle)
        
        // Clean up test battle
        await supabase
          .from('battles')
          .delete()
          .eq('id', newBattle[0].id)
        console.log('🧹 Test battle cleaned up')
      }
    } else {
      console.log('⚠️ Cannot test battle creation - missing beats or profiles')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testBattleCreation()

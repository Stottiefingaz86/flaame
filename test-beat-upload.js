// Test script to check beat upload functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBeatUpload() {
  try {
    console.log('Testing beat upload functionality...')
    
    // Check if beats bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return
    }
    
    console.log('Available buckets:', buckets.map(b => b.name))
    
    const beatsBucket = buckets.find(b => b.name === 'beats')
    if (!beatsBucket) {
      console.log('❌ Beats bucket does not exist')
      console.log('You need to create the beats storage bucket in Supabase')
      return
    }
    
    console.log('✅ Beats bucket exists')
    
    // Test database connection
    const { data: beats, error: beatsError } = await supabase
      .from('beats')
      .select('*')
      .limit(1)
    
    if (beatsError) {
      console.error('❌ Error querying beats table:', beatsError)
      return
    }
    
    console.log('✅ Beats table is accessible')
    console.log('Sample beat data:', beats)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testBeatUpload()

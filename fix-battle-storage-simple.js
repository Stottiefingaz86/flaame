require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixBattleStorage() {
  try {
    console.log('🔧 Testing battle-tracks storage access...')

    // Test upload with an audio file (create a small MP3-like blob)
    const testAudioContent = new Uint8Array([0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    const testFile = new Blob([testAudioContent], { type: 'audio/mpeg' })
    const testFileName = `test-${Date.now()}.mp3`
    
    console.log('🧪 Testing upload to battle-tracks...')
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('battle-tracks')
      .upload(testFileName, testFile)

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError)
      
      // If it's an RLS error, let's try to disable RLS temporarily
      if (uploadError.message.includes('row-level security')) {
        console.log('🔧 Attempting to fix RLS policy...')
        
        // Try to create a simple policy using direct SQL
        const { error: policyError } = await supabase
          .from('storage.objects')
          .select('*')
          .limit(1)
        
        if (policyError) {
          console.log('❌ Cannot access storage.objects table:', policyError.message)
        }
      }
    } else {
      console.log('✅ Upload successful:', uploadData)
      
      // Clean up test file
      await supabase.storage
        .from('battle-tracks')
        .remove([testFileName])
      console.log('🧹 Cleaned up test file')
    }

    // Let's also check what buckets exist and their policies
    console.log('📋 Checking available buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
    } else {
      console.log('Available buckets:', buckets.map(b => b.name))
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixBattleStorage()


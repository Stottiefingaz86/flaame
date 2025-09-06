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

async function fixStoragePolicies() {
  try {
    console.log('🔧 Fixing storage policies for direct uploads...')

    // Test if we can access the storage.objects table
    const { data, error } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Cannot access storage.objects table:', error.message)
      console.log('This might be a permissions issue with the service role key')
      return
    }

    console.log('✅ Can access storage.objects table')

    // Let's try to create a simple policy using the management API
    // First, let's check what policies exist
    console.log('📋 Checking existing policies...')
    
    // Try to get policies (this might not work with the current setup)
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage')

      if (policiesError) {
        console.log('⚠️  Cannot query policies table:', policiesError.message)
      } else {
        console.log('📋 Existing policies:', policies)
      }
    } catch (err) {
      console.log('⚠️  Cannot query policies:', err.message)
    }

    // Test upload with service role (this should work)
    console.log('🧪 Testing upload with service role...')
    const testFile = new Blob(['test content'], { type: 'audio/mpeg' })
    const testFileName = `test-${Date.now()}.mp3`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('battle-tracks')
      .upload(testFileName, testFile)

    if (uploadError) {
      console.error('❌ Service role upload failed:', uploadError)
    } else {
      console.log('✅ Service role upload successful:', uploadData)
      
      // Clean up
      await supabase.storage
        .from('battle-tracks')
        .remove([testFileName])
      console.log('🧹 Cleaned up test file')
    }

    console.log('💡 The issue is likely that the frontend (anon key) cannot upload due to RLS policies')
    console.log('💡 We need to either:')
    console.log('   1. Fix the RLS policies to allow anon uploads')
    console.log('   2. Use a different approach for uploads')
    console.log('   3. Check if the bucket has the right permissions')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixStoragePolicies()


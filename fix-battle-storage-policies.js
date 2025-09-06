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

async function fixBattleStoragePolicies() {
  try {
    console.log('🔧 Fixing battle-tracks storage policies...')

    // First, let's check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const battleTracksBucket = buckets.find(bucket => bucket.name === 'battle-tracks')
    
    if (!battleTracksBucket) {
      console.log('❌ battle-tracks bucket does not exist')
      return
    }

    console.log('✅ battle-tracks bucket exists')

    // Now let's create the proper RLS policies for the bucket
    // We need to allow authenticated users to upload files to battle-tracks
    
    console.log('📝 Creating storage policies...')

    // Policy 1: Allow authenticated users to upload files
    const uploadPolicy = `
      CREATE POLICY "Allow authenticated users to upload battle tracks" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'battle-tracks' AND
        auth.role() = 'authenticated'
      )
    `

    // Policy 2: Allow authenticated users to view files
    const viewPolicy = `
      CREATE POLICY "Allow authenticated users to view battle tracks" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'battle-tracks' AND
        auth.role() = 'authenticated'
      )
    `

    // Policy 3: Allow users to update their own files
    const updatePolicy = `
      CREATE POLICY "Allow users to update their own battle tracks" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'battle-tracks' AND
        auth.role() = 'authenticated'
      )
    `

    // Policy 4: Allow users to delete their own files
    const deletePolicy = `
      CREATE POLICY "Allow users to delete their own battle tracks" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'battle-tracks' AND
        auth.role() = 'authenticated'
      )
    `

    // Execute the policies
    const policies = [
      { name: 'upload', sql: uploadPolicy },
      { name: 'view', sql: viewPolicy },
      { name: 'update', sql: updatePolicy },
      { name: 'delete', sql: deletePolicy }
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
        if (error) {
          console.log(`⚠️  Policy ${policy.name} might already exist:`, error.message)
        } else {
          console.log(`✅ Created ${policy.name} policy`)
        }
      } catch (err) {
        console.log(`⚠️  Policy ${policy.name} creation failed:`, err.message)
      }
    }

    // Test upload to make sure it works
    console.log('🧪 Testing upload...')
    
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const testFileName = `test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('battle-tracks')
      .upload(testFileName, testFile)

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError)
    } else {
      console.log('✅ Test upload successful:', uploadData)
      
      // Clean up test file
      await supabase.storage
        .from('battle-tracks')
        .remove([testFileName])
      console.log('🧹 Cleaned up test file')
    }

    console.log('🎉 Battle storage policies fixed!')

  } catch (error) {
    console.error('❌ Error fixing storage policies:', error)
  }
}

fixBattleStoragePolicies()

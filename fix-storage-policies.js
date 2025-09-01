// Fix Supabase storage RLS policies for audio bucket
// Run this with: node fix-storage-policies.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixStoragePolicies() {
  try {
    console.log('🔧 Fixing storage RLS policies...')
    
    // First, let's check if the audio bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return
    }
    
    const audioBucket = buckets.find(bucket => bucket.name === 'audio')
    
    if (!audioBucket) {
      console.log('📦 Creating audio bucket...')
      const { data, error } = await supabase.storage.createBucket('audio', {
        public: false,
        fileSizeLimit: 100 * 1024 * 1024, // 100MB
        allowedMimeTypes: [
          'audio/mpeg',
          'audio/wav',
          'audio/mp3',
          'audio/mp4',
          'video/mp4',
          'video/quicktime'
        ]
      })
      
      if (error) {
        console.error('Error creating bucket:', error)
        return
      }
      
      console.log('✅ Audio bucket created successfully')
    } else {
      console.log('✅ Audio bucket already exists')
    }
    
    // Now let's set up the RLS policies
    console.log('🔐 Setting up storage RLS policies...')
    
    // Policy 1: Allow authenticated users to upload files
    const { error: uploadPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
        VALUES (
          'audio_upload_policy',
          'audio',
          'Allow authenticated users to upload audio files',
          'auth.role() = ''authenticated''',
          'auth.role() = ''authenticated''',
          'INSERT'
        )
        ON CONFLICT (id) DO UPDATE SET
          definition = EXCLUDED.definition,
          check_expression = EXCLUDED.check_expression;
      `
    })
    
    if (uploadPolicyError) {
      console.log('Upload policy error (might already exist):', uploadPolicyError.message)
    } else {
      console.log('✅ Upload policy created')
    }
    
    // Policy 2: Allow authenticated users to read files
    const { error: readPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
        VALUES (
          'audio_read_policy',
          'audio',
          'Allow authenticated users to read audio files',
          'auth.role() = ''authenticated''',
          'auth.role() = ''authenticated''',
          'SELECT'
        )
        ON CONFLICT (id) DO UPDATE SET
          definition = EXCLUDED.definition,
          check_expression = EXCLUDED.check_expression;
      `
    })
    
    if (readPolicyError) {
      console.log('Read policy error (might already exist):', readPolicyError.message)
    } else {
      console.log('✅ Read policy created')
    }
    
    // Policy 3: Allow users to update their own files
    const { error: updatePolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
        VALUES (
          'audio_update_policy',
          'audio',
          'Allow users to update their own audio files',
          'auth.uid()::text = (storage.foldername(name))[1]',
          'auth.uid()::text = (storage.foldername(name))[1]',
          'UPDATE'
        )
        ON CONFLICT (id) DO UPDATE SET
          definition = EXCLUDED.definition,
          check_expression = EXCLUDED.check_expression;
      `
    })
    
    if (updatePolicyError) {
      console.log('Update policy error (might already exist):', updatePolicyError.message)
    } else {
      console.log('✅ Update policy created')
    }
    
    // Test upload
    console.log('🧪 Testing upload...')
    const testFile = new Blob(['test audio content'], { type: 'audio/mpeg' })
    const testFileName = `test-${Date.now()}.mp3`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(`test/${testFileName}`, testFile)
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError)
    } else {
      console.log('✅ Test upload successful:', uploadData.path)
      
      // Clean up test file
      await supabase.storage.from('audio').remove([uploadData.path])
      console.log('🧹 Test file cleaned up')
    }
    
    console.log('🎉 Storage policies setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up storage policies:', error)
  }
}

fixStoragePolicies()

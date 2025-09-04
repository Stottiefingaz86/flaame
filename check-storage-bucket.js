import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAndCreateStorageBucket() {
  try {
    console.log('Checking existing storage buckets...')
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    console.log('Existing buckets:', buckets?.map(b => b.name))
    
    // Check if 'beats' bucket exists
    const beatsBucket = buckets?.find(b => b.name === 'beats')
    
    if (beatsBucket) {
      console.log('✅ Beats bucket already exists')
      return
    }
    
    console.log('❌ Beats bucket not found, creating...')
    
    // Create the beats bucket
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('beats', {
      public: true,
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'video/mp4', 'video/quicktime'],
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (createError) {
      console.error('Error creating beats bucket:', createError)
      return
    }
    
    console.log('✅ Beats bucket created successfully:', newBucket)
    
    // Set public access policy
    const { error: policyError } = await supabase.storage.from('beats').createSignedUrl('test', 60)
    
    if (policyError) {
      console.log('Note: Bucket created but may need RLS policies configured')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkAndCreateStorageBucket()

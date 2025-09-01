const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStorageBucket() {
  try {
    console.log('Checking audio storage bucket...')
    
    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return
    }
    
    console.log('Available buckets:', buckets.map(b => b.name))
    
    // Check if audio bucket exists
    const audioBucket = buckets.find(b => b.name === 'audio')
    if (!audioBucket) {
      console.error('❌ Audio bucket does not exist!')
      console.log('You need to create the audio bucket in Supabase Storage')
      return
    }
    
    console.log('✅ Audio bucket exists:', audioBucket)
    
    // Try to list files in battles folder
    const { data: files, error: filesError } = await supabase.storage
      .from('audio')
      .list('battles', { limit: 5 })
    
    if (filesError) {
      console.error('Error listing files in battles folder:', filesError)
    } else {
      console.log('Files in battles folder:', files)
    }
    
    // Test upload permissions with a small test file
    const testContent = new Blob(['test'], { type: 'text/plain' })
    const testFileName = `test-${Date.now()}.txt`
    
    console.log('Testing upload permissions...')
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(`battles/${testFileName}`, testContent)
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError)
    } else {
      console.log('✅ Upload test successful')
      
      // Clean up test file
      await supabase.storage
        .from('audio')
        .remove([`battles/${testFileName}`])
      console.log('Test file cleaned up')
    }
    
  } catch (error) {
    console.error('Error checking storage:', error)
  }
}

checkStorageBucket()

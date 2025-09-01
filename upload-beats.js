const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://qfeysqvdsziaucesgfwz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZXlzcXZkc3ppYXVjZXNnZnd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY0NTIzMCwiZXhwIjoyMDcyMjIxMjMwfQ.2VyEJLZHcmjvkmqrw3gEPfKarcW8ojGWHBZQEhXkJMw'

const supabase = createClient(supabaseUrl, supabaseKey)

const beatsFolder = './public/free beats/'

async function uploadBeats() {
  try {
    console.log('Starting beat upload...')
    
    // Read all WAV files from the folder
    const files = fs.readdirSync(beatsFolder).filter(file => 
      file.toLowerCase().endsWith('.wav')
    )
    
    console.log(`Found ${files.length} WAV files`)
    
    for (const file of files) {
      const filePath = path.join(beatsFolder, file)
      const fileName = path.basename(file, '.wav')
      
      console.log(`Uploading ${file}...`)
      
      // Read the file
      const fileBuffer = fs.readFileSync(filePath)
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('beats')
        .upload(`free-beats/${file}`, fileBuffer, {
          contentType: 'audio/wav'
        })
      
      if (uploadError) {
        console.error(`Error uploading ${file}:`, uploadError)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('beats')
        .getPublicUrl(`free-beats/${file}`)
      
      // Extract title from filename
      let title = fileName
        .replace(/\(by\.Stottiefingaz\)/gi, '')
        .replace(/\(by\.StottieFingaz\)/gi, '')
        .replace(/\.wav$/gi, '')
        .trim()
      
      // Add to database
      const { error: insertError } = await supabase
        .from('beats')
        .insert({
          title: title,
          artist: 'StottieFingaz',
          description: `Free beat by StottieFingaz - ${title}`,
          genre: 'Hip Hop',
          bpm: 140, // Default BPM
          key: 'C', // Default key
          tags: ['free', 'hip hop', 'stottiefingaz'],
          is_free: true,
          price: 0,
          audio_url: publicUrl,
          producer_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          duration: 180, // Default 3 minutes
          download_count: 0,
          rating: 0
        })
      
      if (insertError) {
        console.error(`Error inserting ${title} into database:`, insertError)
      } else {
        console.log(`✅ Successfully uploaded and added ${title}`)
      }
    }
    
    console.log('Beat upload complete!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

uploadBeats()


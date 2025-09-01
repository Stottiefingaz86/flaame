const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://qfeysqvdsziaucesgfwz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZXlzcXZkc3ppYXVjZXNnZnd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY0NTIzMCwiZXhwIjoyMDcyMjIxMjMwfQ.2VyEJLZHcmjvkmqrw3gEPfKarcW8ojGWHBZQEhXkJMw'

const supabase = createClient(supabaseUrl, supabaseKey)

const beats = [
  {
    title: 'Sinister',
    artist: 'StottieFingaz',
    description: 'Dark and menacing beat perfect for aggressive flows',
    genre: 'Hip Hop',
    bpm: 140,
    key: 'C',
    tags: ['dark', 'aggressive', 'sinister', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Sinister.(by.Stottiefingaz)wav.wav'
  },
  {
    title: 'Bring It',
    artist: 'StottieFingaz', 
    description: 'High energy beat that brings the heat',
    genre: 'Hip Hop',
    bpm: 145,
    key: 'F',
    tags: ['energy', 'heat', 'bring it', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Bring%20It(by.StottieFingaz).wav'
  },
  {
    title: '1996',
    artist: 'StottieFingaz',
    description: 'Classic 90s inspired beat with modern flavor',
    genre: 'Hip Hop', 
    bpm: 135,
    key: 'G',
    tags: ['90s', 'classic', 'nostalgic', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/1996(by.Stottiefingaz.wav'
  },
  {
    title: 'Toke of Hell',
    artist: 'StottieFingaz',
    description: 'Dark and atmospheric beat with hellish vibes',
    genre: 'Hip Hop',
    bpm: 130,
    key: 'D',
    tags: ['dark', 'hell', 'atmospheric', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Toke%20of%20hell(by.Stottiefingaz).wav'
  },
  {
    title: 'BLOW',
    artist: 'StottieFingaz',
    description: 'Explosive beat that hits hard',
    genre: 'Hip Hop',
    bpm: 150,
    key: 'A',
    tags: ['explosive', 'hard', 'blow', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/BLOW(by.Stottiefingaz).wav'
  },
  {
    title: 'Fight',
    artist: 'StottieFingaz',
    description: 'Battle-ready beat for lyrical warfare',
    genre: 'Hip Hop',
    bpm: 140,
    key: 'E',
    tags: ['battle', 'fight', 'warfare', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Fight(by.Stottiefingaz).wav'
  },
  {
    title: 'Sucker',
    artist: 'StottieFingaz',
    description: 'Smooth beat with sucker punch energy',
    genre: 'Hip Hop',
    bpm: 135,
    key: 'B',
    tags: ['smooth', 'sucker', 'punch', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Sucker(by.Stottiefingaz.wav'
  },
  {
    title: 'Kick It',
    artist: 'StottieFingaz',
    description: 'Laid back beat to kick it to',
    genre: 'Hip Hop',
    bpm: 125,
    key: 'C',
    tags: ['laid back', 'kick it', 'chill', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Kick%20It%20(by.Stottiefingaz).wav'
  },
  {
    title: 'Booming',
    artist: 'StottieFingaz',
    description: 'Bass-heavy beat that booms through speakers',
    genre: 'Hip Hop',
    bpm: 145,
    key: 'F',
    tags: ['bass', 'booming', 'heavy', 'free'],
    audio_url: 'https://qfeysqvdsziaucesgfwz.supabase.co/storage/v1/object/public/beats/free-beats/Booming(by.Stottiefingaz).wav'
  }
]

async function addBeats() {
  try {
    console.log('Adding beats to database...')
    
    for (const beat of beats) {
      console.log(`Adding ${beat.title}...`)
      
      const { error } = await supabase
        .from('beats')
        .insert({
          title: beat.title,
          artist: beat.artist,
          description: beat.description,
          genre: beat.genre,
          bpm: beat.bpm,
          key: beat.key,
          tags: beat.tags,
          is_free: true,
          price: 0,
          audio_url: beat.audio_url,
          producer_id: null, // Set to null instead of placeholder UUID
          duration: 180, // 3 minutes default
          download_count: 0,
          rating: 0
        })
      
      if (error) {
        console.error(`Error adding ${beat.title}:`, error)
      } else {
        console.log(`✅ Added ${beat.title}`)
      }
    }
    
    console.log('Done adding beats!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addBeats()

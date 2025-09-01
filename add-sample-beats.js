// Script to add sample beats to the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleBeats = [
  {
    title: 'Dark Trap Beat',
    artist: 'Prod. Nova',
    description: 'Aggressive dark trap beat perfect for battle rap',
    genre: 'Trap',
    bpm: 140,
    key: 'C',
    is_free: true,
    is_original: true,
    copyright_verified: true,
    is_available: true,
    cost_flames: 0
  },
  {
    title: 'Street Dreams',
    artist: 'Prod. Beats',
    description: 'Hard-hitting street beat with heavy bass',
    genre: 'Hip Hop',
    bpm: 95,
    key: 'F',
    is_free: true,
    is_original: true,
    copyright_verified: true,
    is_available: true,
    cost_flames: 0
  },
  {
    title: 'Urban Nights',
    artist: 'Prod. Urban',
    description: 'Smooth urban beat with atmospheric vibes',
    genre: 'Hip Hop',
    bpm: 90,
    key: 'G',
    is_free: true,
    is_original: true,
    copyright_verified: true,
    is_available: true,
    cost_flames: 0
  },
  {
    title: 'Weekend Vibes',
    artist: 'Prod. Weekend',
    description: 'Upbeat weekend anthem beat',
    genre: 'Hip Hop',
    bpm: 120,
    key: 'A',
    is_free: true,
    is_original: true,
    copyright_verified: true,
    is_available: true,
    cost_flames: 0
  },
  {
    title: 'Midnight Flow',
    artist: 'Prod. Nova',
    description: 'Smooth midnight vibes for late night sessions',
    genre: 'Hip Hop',
    bpm: 85,
    key: 'D',
    is_free: true,
    is_original: true,
    copyright_verified: true,
    is_available: true,
    cost_flames: 0
  }
]

async function addSampleBeats() {
  try {
    console.log('Adding sample beats to database...')
    
    // Check if beats already exist
    const { data: existingBeats, error: checkError } = await supabase
      .from('beats')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('Error checking existing beats:', checkError)
      return
    }
    
    if (existingBeats && existingBeats.length > 0) {
      console.log('Beats already exist in database')
      return
    }
    
    // Insert sample beats
    const { data, error } = await supabase
      .from('beats')
      .insert(sampleBeats)
      .select()
    
    if (error) {
      console.error('Error adding sample beats:', error)
      return
    }
    
    console.log('✅ Successfully added sample beats:', data)
    
  } catch (error) {
    console.error('Failed to add sample beats:', error)
  }
}

addSampleBeats()

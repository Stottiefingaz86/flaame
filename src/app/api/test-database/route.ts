import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database tables...')

    const results: any = {
      user_customizations: { exists: false, error: null },
      equipped_items: { exists: false, error: null },
      beats: { exists: false, error: null },
      battles: { exists: false, error: null },
      profiles: { exists: false, error: null }
    }

    // Test user_customizations table
    try {
      const { data, error } = await supabase
        .from('user_customizations')
        .select('*')
        .limit(1)

      if (error) {
        results.user_customizations.error = error.message
        console.log('user_customizations table error:', error.message)
      } else {
        results.user_customizations.exists = true
        console.log('user_customizations table exists')
      }
    } catch (e) {
      results.user_customizations.error = e instanceof Error ? e.message : 'Unknown error'
      console.log('user_customizations table test failed:', e)
    }

    // Test equipped_items table
    try {
      const { data, error } = await supabase
        .from('equipped_items')
        .select('*')
        .limit(1)

      if (error) {
        results.equipped_items.error = error.message
        console.log('equipped_items table error:', error.message)
      } else {
        results.equipped_items.exists = true
        console.log('equipped_items table exists')
      }
    } catch (e) {
      results.equipped_items.error = e instanceof Error ? e.message : 'Unknown error'
      console.log('equipped_items table test failed:', e)
    }

    // Test beats table
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .limit(1)

      if (error) {
        results.beats.error = error.message
        console.log('beats table error:', error.message)
      } else {
        results.beats.exists = true
        results.beats.count = data?.length || 0
        results.beats.sample = data?.[0] || null
        console.log('beats table exists, count:', data?.length || 0)
        console.log('beats sample:', data?.[0])
      }
    } catch (e) {
      results.beats.error = e instanceof Error ? e.message : 'Unknown error'
      console.log('beats table test failed:', e)
    }

    // Test beats for specific user - try different column names
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('creator_id', '754a7926-a305-4f90-98a1-3d7ebc02d4be')

      if (error) {
        results.user_beats = { error: error.message }
        console.log('user beats error (creator_id):', error.message)
      } else {
        results.user_beats = { count: data?.length || 0, data: data }
        console.log('user beats count (creator_id):', data?.length || 0)
      }
    } catch (e) {
      results.user_beats = { error: e instanceof Error ? e.message : 'Unknown error' }
      console.log('user beats test failed:', e)
    }

    // Test beats for specific user - try author_id
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('author_id', '754a7926-a305-4f90-98a1-3d7ebc02d4be')

      if (error) {
        results.user_beats_author = { error: error.message }
        console.log('user beats error (author_id):', error.message)
      } else {
        results.user_beats_author = { count: data?.length || 0, data: data }
        console.log('user beats count (author_id):', data?.length || 0)
      }
    } catch (e) {
      results.user_beats_author = { error: e instanceof Error ? e.message : 'Unknown error' }
      console.log('user beats test failed (author_id):', e)
    }

    // Test battles table
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .limit(1)

      if (error) {
        results.battles.error = error.message
        console.log('battles table error:', error.message)
      } else {
        results.battles.exists = true
        results.battles.sample = data?.[0] || null
        console.log('battles table exists, sample:', data?.[0])
      }
    } catch (e) {
      results.battles.error = e instanceof Error ? e.message : 'Unknown error'
      console.log('battles table test failed:', e)
    }

    // Test battles for specific user
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .or(`challenger_id.eq.754a7926-a305-4f90-98a1-3d7ebc02d4be,opponent_id.eq.754a7926-a305-4f90-98a1-3d7ebc02d4be`)

      if (error) {
        results.user_battles = { error: error.message }
        console.log('user battles error:', error.message)
      } else {
        results.user_battles = { count: data?.length || 0, data: data }
        console.log('user battles count:', data?.length || 0)
        if (data && data.length > 0) {
          console.log('Sample battle data:', JSON.stringify(data[0], null, 2))
        }
      }
    } catch (e) {
      results.user_battles = { error: e instanceof Error ? e.message : 'Unknown error' }
      console.log('user battles test failed:', e)
    }

    // Test battles with join
    try {
      const { data, error } = await supabase
        .from('battles')
        .select(`
          *,
          challenger:profiles!battles_challenger_id_fkey(id, username, avatar_id),
          opponent:profiles!battles_opponent_id_fkey(id, username, avatar_id)
        `)
        .or(`challenger_id.eq.754a7926-a305-4f90-98a1-3d7ebc02d4be,opponent_id.eq.754a7926-a305-4f90-98a1-3d7ebc02d4be`)

      if (error) {
        results.user_battles_join = { error: error.message }
        console.log('user battles join error:', error.message)
      } else {
        results.user_battles_join = { count: data?.length || 0, data: data }
        console.log('user battles join count:', data?.length || 0)
      }
    } catch (e) {
      results.user_battles_join = { error: e instanceof Error ? e.message : 'Unknown error' }
      console.log('user battles join test failed:', e)
    }

    // Test profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (error) {
        results.profiles.error = error.message
        console.log('profiles table error:', error.message)
      } else {
        results.profiles.exists = true
        console.log('profiles table exists')
      }
    } catch (e) {
      results.profiles.error = e instanceof Error ? e.message : 'Unknown error'
      console.log('profiles table test failed:', e)
    }

    console.log('Database test completed:', results)

    return NextResponse.json({
      success: true,
      results,
      message: 'Database tables tested. Check results for table status.'
    })
  } catch (error) {
    console.error('Error in database test:', error)
    return NextResponse.json(
      { error: 'Failed to test database' },
      { status: 500 }
    )
  }
}

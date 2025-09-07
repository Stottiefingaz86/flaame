import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawUsername = searchParams.get('username')
    
    if (!rawUsername) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // URL decode the username and normalize it
    const username = decodeURIComponent(rawUsername)
    console.log(`Fetching user by username: ${username} (raw: ${rawUsername})`)

    // Get user profile by username - try exact match first
    let { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, username, avatar_id, is_verified, rank, flames, instagram_username')
      .eq('username', username)
      .single()

    // If not found, try with underscores instead of spaces
    if (userError && username.includes(' ')) {
      const usernameWithUnderscores = username.replace(/ /g, '_')
      console.log(`Trying with underscores: ${usernameWithUnderscores}`)
      
      const { data: userWithUnderscores, error: userWithUnderscoresError } = await supabase
        .from('profiles')
        .select('id, username, avatar_id, is_verified, rank, flames, instagram_username')
        .eq('username', usernameWithUnderscores)
        .single()
      
      if (!userWithUnderscoresError) {
        user = userWithUnderscores
        userError = null
      }
    }

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Found user: ${user.username} (ID: ${user.id})`)

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error in user-by-username API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

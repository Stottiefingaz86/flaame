import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    if (!isValidUUID(userId)) {
      console.error(`Invalid UUID format: ${userId}`)
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    console.log(`Fetching equipped items for user: ${userId}`)

    // Get user's equipped items
    const { data: items, error: itemsError } = await supabase
      .from('equipped_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_equipped', true)

    if (itemsError) {
      console.error('Error fetching equipped items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch equipped items' },
        { status: 500 }
      )
    }

    console.log(`Found ${items?.length || 0} equipped items for user ${userId}`)

    return NextResponse.json({
      success: true,
      items: items || []
    })
  } catch (error) {
    console.error('Error in equipped-items API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

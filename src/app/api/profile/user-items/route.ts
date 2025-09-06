import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    console.log(`Fetching items for user: ${userId}`)

    // Get user's purchased items
    const { data: items, error: itemsError } = await supabase
      .from('user_customizations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (itemsError) {
      console.error('Error fetching user items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch user items' },
        { status: 500 }
      )
    }

    console.log(`Found ${items?.length || 0} items for user ${userId}`)

    return NextResponse.json({
      success: true,
      items: items || []
    })
  } catch (error) {
    console.error('Error in user-items API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

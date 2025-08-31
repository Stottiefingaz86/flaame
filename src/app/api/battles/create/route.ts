import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, beatId, maxEntries = 2, entryDeadline, votingDeadline } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Calculate deadlines if not provided
    const now = new Date()
    const entryDeadlineDate = entryDeadline ? new Date(entryDeadline) : new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000) // 6 days
    const votingDeadlineDate = votingDeadline ? new Date(votingDeadline) : new Date(entryDeadlineDate.getTime() + 24 * 60 * 60 * 1000) // 1 day after entry deadline

    // Create battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        title,
        description,
        beat_id: beatId || null,
        creator_id: user.id,
        max_entries: maxEntries,
        entry_deadline: entryDeadlineDate.toISOString(),
        voting_deadline: votingDeadlineDate.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (battleError) {
      console.error('Battle creation error:', battleError)
      return NextResponse.json({ error: 'Failed to create battle' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      battle,
      message: 'Battle created successfully!' 
    })

  } catch (error) {
    console.error('Battle creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { entryId, lyrics } = await request.json()
    
    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }
    
    // Check if entry exists and user owns it
    const { data: entry, error: entryError } = await supabase
      .from('battle_entries')
      .select('id, user_id, battle_id')
      .eq('id', entryId)
      .eq('battle_id', id)
      .single()
      
    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }
    
    // Check ownership
    if (entry.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own lyrics' },
        { status: 403 }
      )
    }
    
    // Update lyrics
    const { error: updateError } = await supabase
      .from('battle_entries')
      .update({ lyrics: lyrics || null })
      .eq('id', entryId)
      .eq('user_id', user.id) // Extra safety check
      
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update lyrics' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lyrics updated successfully'
    })
    
  } catch (error) {
    console.error('Lyrics update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

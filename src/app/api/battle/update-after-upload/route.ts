import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { battleId, fileName, lyrics, userId } = await request.json()

    if (!battleId || !fileName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update battle record with the uploaded file info
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        opponent_id: userId,
        opponent_track: fileName,
        opponent_lyrics: lyrics || null,
        status: 'active',
        ends_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
        updated_at: new Date().toISOString()
      })
      .eq('id', battleId)

    if (updateError) {
      console.error('Error updating battle:', updateError)
      return NextResponse.json(
        { error: 'Failed to update battle' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Battle updated successfully' 
    })

  } catch (error) {
    console.error('Error in update battle API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


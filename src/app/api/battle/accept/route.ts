import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ChatService } from '@/lib/chat'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audioFile') as File
    const battleId = formData.get('battleId') as string
    const lyrics = formData.get('lyrics') as string
    const userId = formData.get('userId') as string

    if (!battleId || !audioFile || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file size (max 15MB for Vercel function limit)
    const maxSize = 15 * 1024 * 1024 // 15MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 15MB' },
        { status: 413 }
      )
    }

    // First, verify the user is allowed to accept this battle
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('id, challenger_id, opponent_id, status')
      .eq('id', battleId)
      .single()

    if (fetchError) {
      console.error('Error fetching battle:', fetchError)
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      )
    }

    // Check if user is the challenger (can't accept own battle)
    if (battle.challenger_id === userId) {
      return NextResponse.json(
        { error: 'You cannot accept your own battle' },
        { status: 400 }
      )
    }

    // Check if battle is in a state that can be accepted
    if (battle.status !== 'pending' && battle.status !== 'challenge') {
      return NextResponse.json(
        { error: 'Battle cannot be accepted in current state' },
        { status: 400 }
      )
    }

    // Upload the audio file to storage
    const trackFileName = `battle-tracks/${battleId}/${Date.now()}-reply.mp3`
    
    const { error: uploadError } = await supabase.storage
      .from('battle-tracks')
      .upload(trackFileName, audioFile)

    if (uploadError) {
      console.error('Error uploading audio file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      )
    }

    // Calculate new end time (6 days from now)
    const newEndTime = new Date()
    newEndTime.setDate(newEndTime.getDate() + 6)

    // Update the battle with opponent's reply
    const { error: updateError } = await supabase
      .from('battles')
      .update({
        opponent_id: userId,
        opponent_track: trackFileName,
        opponent_lyrics: lyrics || null,
        status: 'active',
        ends_at: newEndTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', battleId)

    if (updateError) {
      console.error('Error updating battle:', updateError)
      return NextResponse.json(
        { error: 'Failed to accept battle' },
        { status: 500 }
      )
    }

    // Send chat notification
    try {
      const chatService = new ChatService()
      const battleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/battle/${battleId}`
      
      // Get user details for the notification
      const { data: userData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()
      
      if (userData) {
        const message = `✅ ${userData.username} accepted the battle! [View Battle](${battleUrl})`
        await chatService.sendSystemMessage(message, battleId)
      }
    } catch (chatError) {
      console.error('Failed to send chat notification:', chatError)
      // Don't fail the battle acceptance if chat fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Battle accepted successfully' 
    })

  } catch (error) {
    console.error('Error in accept battle API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BattleSystem } from '@/lib/battle-system'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { battleId, votedFor, userId } = await request.json()

    if (!battleId || !votedFor || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get battle details
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('challenger_id, opponent_id, status, ends_at, challenger_votes, opponent_votes')
      .eq('id', battleId)
      .single()

    if (battleError) {
      console.error('Error fetching battle:', battleError)
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      )
    }

    // Check if battle is active
    if (battle.status !== 'active') {
      return NextResponse.json(
        { error: 'Battle is not active for voting' },
        { status: 400 }
      )
    }

    // Check if battle has ended
    if (new Date(battle.ends_at) <= new Date()) {
      return NextResponse.json(
        { error: 'Battle has ended' },
        { status: 400 }
      )
    }

    // Check if user has already voted in this battle
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', battleId)
      .eq('voter_id', userId)
      .single()
      
    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Error checking vote status:', voteCheckError)
      return NextResponse.json(
        { error: 'Error checking vote status' },
        { status: 500 }
      )
    }
    
    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this battle' },
        { status: 400 }
      )
    }

    const targetUserId = votedFor === 'challenger' ? battle.challenger_id : battle.opponent_id
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Invalid vote target' },
        { status: 400 }
      )
    }

    // For now, we'll use a simple approach that works with the current schema
    // We'll create a temporary battle entry for the user we're voting for, then vote for that entry
    // This is a temporary solution until the migration is run
    
    // First, check if there's already a battle entry for the target user
    let targetEntryId: string
    const { data: existingEntry, error: entryCheckError } = await supabase
      .from('battle_entries')
      .select('id')
      .eq('battle_id', battleId)
      .eq('user_id', targetUserId)
      .single()
    
    if (existingEntry) {
      targetEntryId = existingEntry.id
    } else {
      // Create a temporary battle entry for the target user
      const { data: newEntry, error: entryError } = await supabase
        .from('battle_entries')
        .insert({
          battle_id: battleId,
          user_id: targetUserId,
          audio_file_path: null, // No actual audio file for direct voting
          lyrics: null
        })
        .select('id')
        .single()
      
      if (entryError) {
        console.error('Error creating battle entry:', entryError)
        return NextResponse.json(
          { error: 'Failed to create vote entry' },
          { status: 500 }
        )
      }
      
      targetEntryId = newEntry.id
    }
    
    // Create the vote record
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        battle_id: battleId,
        voter_id: userId,
        entry_id: targetEntryId
      })

    if (voteError) {
      console.error('Error recording vote:', voteError)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    // Update vote counts
    const newChallengerVotes = votedFor === 'challenger' ? battle.challenger_votes + 1 : battle.challenger_votes
    const newOpponentVotes = votedFor === 'opponent' ? battle.opponent_votes + 1 : battle.opponent_votes

    const { error: updateError } = await supabase
      .from('battles')
      .update({
        challenger_votes: newChallengerVotes,
        opponent_votes: newOpponentVotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', battleId)

    if (updateError) {
      console.error('Error updating vote counts:', updateError)
      return NextResponse.json(
        { error: 'Failed to update vote counts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vote recorded successfully',
      challenger_votes: newChallengerVotes,
      opponent_votes: newOpponentVotes
    })

  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

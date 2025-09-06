import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // For now, we'll allow multiple votes (we can add vote tracking later)
    // TODO: Implement proper vote tracking to prevent duplicate votes

    // For now, let's skip the votes table and just update the vote counts directly
    // This is simpler and works with the current database structure
    const targetUserId = votedFor === 'challenger' ? battle.challenger_id : battle.opponent_id
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Invalid vote target' },
        { status: 400 }
      )
    }

    // We'll create a simple vote record in a custom way
    // For now, let's just update the vote counts and skip the votes table
    console.log('Voting for:', votedFor, 'Target user:', targetUserId)

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

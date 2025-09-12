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

    // Use the existing BattleSystem method which handles all the logic
    const result = await BattleSystem.voteForBattle(battleId, votedFor, userId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to vote' },
        { status: 400 }
      )
    }

    // Get updated battle data to return current vote counts
    const { data: updatedBattle, error: fetchError } = await supabase
      .from('battles')
      .select('challenger_votes, opponent_votes')
      .eq('id', battleId)
      .single()

    if (fetchError) {
      console.error('Error fetching updated battle:', fetchError)
      return NextResponse.json(
        { error: 'Vote recorded but failed to get updated counts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vote recorded successfully',
      challenger_votes: updatedBattle.challenger_votes,
      opponent_votes: updatedBattle.opponent_votes
    })

  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

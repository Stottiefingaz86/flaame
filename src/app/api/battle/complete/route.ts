import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { battleId } = await request.json()

    if (!battleId) {
      return NextResponse.json(
        { error: 'Battle ID is required' },
        { status: 400 }
      )
    }

    console.log('Completing battle:', battleId)

    // Get battle details
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('id, challenger_id, opponent_id, challenger_votes, opponent_votes, status')
      .eq('id', battleId)
      .single()

    if (battleError) {
      console.error('Error fetching battle:', battleError)
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      )
    }

    // Determine winner
    let winnerId: string | null = null
    if (battle.challenger_votes > battle.opponent_votes) {
      winnerId = battle.challenger_id
    } else if (battle.opponent_votes > battle.challenger_votes) {
      winnerId = battle.opponent_id
    }

    console.log('Battle result:', {
      challenger_votes: battle.challenger_votes,
      opponent_votes: battle.opponent_votes,
      winner_id: winnerId
    })

    // Use a single transaction to update everything at once
    const { data: result, error: updateError } = await supabase.rpc('complete_battle_transaction', {
      battle_id: battleId,
      winner_id: winnerId,
      flame_reward: winnerId ? 3 : 0
    })

    if (updateError) {
      console.error('Error completing battle transaction:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete battle' },
        { status: 500 }
      )
    }

    console.log('Battle completed successfully:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Battle completed successfully',
      winner_id: winnerId,
      challenger_votes: battle.challenger_votes,
      opponent_votes: battle.opponent_votes,
      flames_awarded: winnerId ? 3 : 0
    })

  } catch (error) {
    console.error('Error completing battle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


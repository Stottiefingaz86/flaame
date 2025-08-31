import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/db'
import { spendFlames } from '@/lib/votes'

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
    
    const { entryId } = await request.json()
    
    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }
    
    // Check if battle exists and is in voting phase
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('status, ends_at, challenger_votes, opponent_votes')
      .eq('id', id)
      .single()
      
    if (battleError || !battle) {
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      )
    }
    
    if (battle.status !== 'VOTING') {
      return NextResponse.json(
        { error: 'Battle is not in voting phase' },
        { status: 400 }
      )
    }
    
    // Check if battle has ended
    const now = new Date()
    const endsAt = new Date(battle.ends_at)
    if (now > endsAt) {
      return NextResponse.json(
        { error: 'Voting period has ended' },
        { status: 400 }
      )
    }
    
    // Check if user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', id)
      .eq('voter_id', user.id)
      .single()
      
    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
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
    
    // Check if entry exists and belongs to this battle
    const { data: entry, error: entryError } = await supabase
      .from('battle_entries')
      .select('id')
      .eq('id', entryId)
      .eq('battle_id', id)
      .single()
      
    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Invalid entry' },
        { status: 400 }
      )
    }
    
    // Spend 1 flame for voting
    const spendResult = await spendFlames(user.id, 1, `Vote in battle ${id}`)
    
    if (!spendResult.success) {
      return NextResponse.json(
        { error: spendResult.error?.message || 'Insufficient flames' },
        { status: 400 }
      )
    }
    
    // Record the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        battle_id: id,
        voter_id: user.id,
        entry_id: entryId,
        weight: 1
      })
      
    if (voteError) {
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }
    
    // Update battle vote counts (this would need to be updated based on which participant was voted for)
    // For now, we'll just record the vote without updating battle totals
    // The vote counts should be calculated from the votes table
      
    // Note: Vote counts should be calculated from the votes table
    // This ensures data consistency
    
    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      newBalance: spendResult.newBalance
    })
    
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

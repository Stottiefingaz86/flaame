import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/db'
import { spendFlames } from '@/lib/votes'

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { beatId } = await request.json()
    
    if (!beatId) {
      return NextResponse.json(
        { error: 'Beat ID is required' },
        { status: 400 }
      )
    }
    
    // Get beat details and price
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .select('title, artist, cost_flames')
      .eq('id', beatId)
      .single()
      
    if (beatError || !beat) {
      return NextResponse.json(
        { error: 'Beat not found' },
        { status: 404 }
      )
    }
    
    // Check if user already has a license for this beat
    const { data: existingLicense, error: licenseCheckError } = await supabase
      .from('beat_licenses')
      .select('id')
      .eq('beat_id', beatId)
      .eq('buyer_id', user.id)
      .single()
      
    if (licenseCheckError && licenseCheckError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Error checking license' },
        { status: 500 }
      )
    }
    
    if (existingLicense) {
      return NextResponse.json(
        { error: 'You already own a license for this beat' },
        { status: 400 }
      )
    }
    
    // Spend flames
    const spendResult = await spendFlames(user.id, beat.cost_flames, `Beat license: ${beat.title} by ${beat.artist}`)
    
    if (!spendResult.success) {
      return NextResponse.json(
        { error: spendResult.error?.message || 'Insufficient flames' },
        { status: 400 }
      )
    }
    
    // Create beat license
    const { error: licenseError } = await supabase
      .from('beat_licenses')
      .insert({
        beat_id: beatId,
        buyer_id: user.id
      })
      
    if (licenseError) {
      return NextResponse.json(
        { error: 'Failed to create beat license' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully purchased license for ${beat.title}`,
      newBalance: spendResult.newBalance
    })
    
  } catch (error) {
    console.error('Beat purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

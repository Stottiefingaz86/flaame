import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, itemId, itemName, price, itemType } = await request.json()
    
    if (!userId || !itemId || !itemName || !price || !itemType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    console.log(`User ${userId} purchasing ${itemName} for ${price} flaames`)

    // First, check if user has enough flaames
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('flames')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (profile.flames < price) {
      return NextResponse.json(
        { error: 'Insufficient flaames' },
        { status: 400 }
      )
    }

    // Deduct flaames from user
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        flames: profile.flames - price,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('flames')

    if (updateError) {
      console.error('Error updating flaames:', updateError)
      return NextResponse.json(
        { error: 'Failed to update flaames' },
        { status: 500 }
      )
    }

    // Store the purchased item in user_customizations table
    const { data: customizationData, error: customizationError } = await supabase
      .from('user_customizations')
      .upsert({
        user_id: userId,
        item_id: itemId,
        item_name: itemName,
        item_type: itemType,
        purchased_at: new Date().toISOString(),
        is_active: true
      })
      .select()

    if (customizationError) {
      console.error('Error saving customization:', customizationError)
      // Don't fail the purchase if we can't save the customization
    }

    console.log(`Successfully purchased ${itemName} for user ${userId}`)

    return NextResponse.json({
      success: true,
      newBalance: updateData[0].flames,
      message: `Successfully purchased ${itemName}`,
      customization: customizationData?.[0]
    })
  } catch (error) {
    console.error('Error in purchase-item API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

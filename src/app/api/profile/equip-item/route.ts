import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, itemId, action } = await request.json()
    
    if (!userId || !itemId || !action) {
      return NextResponse.json(
        { error: 'User ID, item ID, and action are required' },
        { status: 400 }
      )
    }

    if (!['equip', 'unequip'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "equip" or "unequip"' },
        { status: 400 }
      )
    }

    console.log(`User ${userId} ${action}ing item ${itemId}`)

    if (action === 'equip') {
      // Check if user owns this item
      const { data: ownership, error: ownershipError } = await supabase
        .from('user_customizations')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('is_active', true)
        .single()

      if (ownershipError || !ownership) {
        return NextResponse.json(
          { error: 'You do not own this item or it is not available' },
          { status: 400 }
        )
      }

      // Update user's profile with the equipped item
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return NextResponse.json(
          { error: 'Failed to equip item' },
          { status: 500 }
        )
      }

      // Store equipped item in equipped_items table
      const { data: equipData, error: equipError } = await supabase
        .from('equipped_items')
        .upsert({
          user_id: userId,
          item_id: itemId,
          equipped_at: new Date().toISOString(),
          is_equipped: true
        })
        .select()

      if (equipError) {
        console.error('Error equipping item:', equipError)
        return NextResponse.json(
          { error: 'Failed to equip item' },
          { status: 500 }
        )
      }

      console.log(`Successfully equipped item ${itemId} for user ${userId}`)

      return NextResponse.json({
        success: true,
        message: 'Item equipped successfully',
        equippedItem: equipData[0]
      })

    } else { // unequip
      // Remove item from equipped_items table entirely
      const { error: unequipError } = await supabase
        .from('equipped_items')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId)

      if (unequipError) {
        console.error('Error unequipping item:', unequipError)
        return NextResponse.json(
          { error: 'Failed to unequip item' },
          { status: 500 }
        )
      }

      console.log(`Successfully unequipped item ${itemId} for user ${userId}`)

      return NextResponse.json({
        success: true,
        message: 'Item unequipped successfully'
      })
    }
  } catch (error) {
    console.error('Error in equip-item API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    
    const { kind, itemId } = await request.json()
    
    if (!kind || !itemId) {
      return NextResponse.json(
        { error: 'Kind and itemId are required' },
        { status: 400 }
      )
    }
    
    // Validate item kind
    if (!['avatar', 'badge', 'theme_color'].includes(kind)) {
      return NextResponse.json(
        { error: 'Invalid item kind' },
        { status: 400 }
      )
    }
    
    // Get item details and price
    let itemPrice = 0
    let itemName = ''
    
    if (kind === 'avatar') {
      const { data: avatar, error: avatarError } = await supabase
        .from('avatars')
        .select('name, cost_flames')
        .eq('id', itemId)
        .single()
        
      if (avatarError || !avatar) {
        return NextResponse.json(
          { error: 'Avatar not found' },
          { status: 404 }
        )
      }
      
      itemPrice = avatar.cost_flames
      itemName = avatar.name
    } else {
      const { data: cosmetic, error: cosmeticError } = await supabase
        .from('cosmetics')
        .select('label, price_flames')
        .eq('id', itemId)
        .eq('kind', kind)
        .single()
        
      if (cosmeticError || !cosmetic) {
        return NextResponse.json(
          { error: 'Cosmetic not found' },
          { status: 404 }
        )
      }
      
      itemPrice = cosmetic.price_flames
      itemName = cosmetic.label
    }
    
    // Check if user already owns this item
    const { data: existingItem, error: checkError } = await supabase
      .from('inventory')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_kind', kind)
      .eq('item_id', itemId)
      .single()
      
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Error checking inventory' },
        { status: 500 }
      )
    }
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'You already own this item' },
        { status: 400 }
      )
    }
    
    // Spend flames
    const spendResult = await spendFlames(user.id, itemPrice, `Purchase ${kind}: ${itemName}`)
    
    if (!spendResult.success) {
      return NextResponse.json(
        { error: spendResult.error?.message || 'Insufficient flames' },
        { status: 400 }
      )
    }
    
    // Add item to inventory
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        user_id: user.id,
        item_kind: kind,
        item_id: itemId
      })
      
    if (inventoryError) {
      return NextResponse.json(
        { error: 'Failed to add item to inventory' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${itemName}`,
      newBalance: spendResult.newBalance
    })
    
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

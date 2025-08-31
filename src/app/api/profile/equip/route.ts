import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/db'

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
    
    const { avatarId, badgeIcon, themeColor } = await request.json()
    
    // Validate that user owns the items they're trying to equip
    const updates: Record<string, string> = {}
    
    if (avatarId) {
      // Check if user owns this avatar
      const { data: avatarOwned, error: avatarCheckError } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_kind', 'avatar')
        .eq('item_id', avatarId)
        .single()
        
      if (avatarCheckError && avatarCheckError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Error checking avatar ownership' },
          { status: 500 }
        )
      }
      
      if (!avatarOwned) {
        return NextResponse.json(
          { error: 'You do not own this avatar' },
          { status: 403 }
        )
      }
      
      updates.avatar_id = avatarId
    }
    
    if (badgeIcon) {
      // Check if user owns this badge
      const { data: badgeOwned, error: badgeCheckError } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_kind', 'badge')
        .eq('item_id', badgeIcon)
        .single()
        
      if (badgeCheckError && badgeCheckError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Error checking badge ownership' },
          { status: 500 }
        )
      }
      
      if (!badgeOwned) {
        return NextResponse.json(
          { error: 'You do not own this badge' },
          { status: 403 }
        )
      }
      
      updates.profile_icon = badgeIcon
    }
    
    if (themeColor) {
      // Check if user owns this theme color
      const { data: themeOwned, error: themeCheckError } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_kind', 'theme_color')
        .eq('item_id', themeColor)
        .single()
        
      if (themeCheckError && themeCheckError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Error checking theme ownership' },
          { status: 500 }
        )
      }
      
      if (!themeOwned) {
        return NextResponse.json(
          { error: 'You do not own this theme color' },
          { status: 403 }
        )
      }
      
      updates.profile_color = themeColor
    }
    
    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Profile equip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

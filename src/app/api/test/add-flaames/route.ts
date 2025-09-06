import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const username = 'stottiefingaz'
    const amount = 5000

    console.log(`Adding ${amount} flaames to user: ${username}`)

    // First, get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, flames')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update the user's flaames
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        flames: profile.flames + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select('flames')

    if (updateError) {
      console.error('Error updating flaames:', updateError)
      return NextResponse.json(
        { error: 'Failed to update flaames' },
        { status: 500 }
      )
    }

    console.log(`Successfully updated ${username} flaames to: ${updateData[0].flames}`)

    return NextResponse.json({
      success: true,
      username,
      oldBalance: profile.flames,
      newBalance: updateData[0].flames,
      added: amount,
      message: `Added ${amount} flaames to ${username}`
    })
  } catch (error) {
    console.error('Error in test add-flaames API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

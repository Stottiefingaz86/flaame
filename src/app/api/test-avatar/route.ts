import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('Test Avatar API - Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      url: supabaseUrl
    })
    
    // List files in avatars bucket
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list('', { limit: 10 })
    
    if (error) {
      console.error('Error listing files:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Try to download Sputniq's avatar
    const avatarPath = 'fa8230b7-5b2a-4bf0-a117-69b9d07bbe2a-1757174813597.png'
    const { data: avatarData, error: avatarError } = await supabase.storage
      .from('avatars')
      .download(avatarPath)
    
    return NextResponse.json({
      files: files?.map(f => f.name),
      avatarTest: {
        path: avatarPath,
        found: !avatarError,
        error: avatarError?.message,
        size: avatarData?.size
      }
    })
    
  } catch (error) {
    console.error('Test Avatar API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

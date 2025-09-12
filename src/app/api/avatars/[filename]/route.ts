import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Validate filename - should not be empty or too short
    if (!filename || filename.length < 3) {
      return new NextResponse('Invalid filename', { status: 400 })
    }

    // Get the file from Supabase Storage
    // The filename parameter can be either:
    // 1. Just the filename (for purchased avatars): "avatar-uuid.jpg"
    // 2. Full path (for uploaded avatars): "avatars/userId-timestamp.ext"
    let filePath = filename
    
    // If filename already includes the "avatars/" prefix, use it as-is
    // Otherwise, add the "avatars/" prefix
    if (!filename.startsWith('avatars/')) {
      filePath = `avatars/${filename}`
    }
    
    // Note: We keep the "avatars/" prefix if it exists because some files are stored in the avatars subfolder
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .download(filePath)

    if (error) {
      // Only log errors for valid-looking filenames to reduce noise
      if (filename.length > 10) {
        console.error('Error downloading avatar:', { filename, filePath, error })
      }
      return new NextResponse('Avatar not found', { status: 404 })
    }

    // Convert blob to buffer
    const buffer = await data.arrayBuffer()

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving avatar:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

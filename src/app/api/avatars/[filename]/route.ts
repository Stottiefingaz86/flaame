import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

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
    // The filename parameter contains the full path (avatars/filename.ext)
    const { data, error } = await supabase.storage
      .from('avatars')
      .download(filename)

    if (error) {
      // Only log errors for valid-looking filenames to reduce noise
      if (filename.length > 10) {
        console.error('Error downloading avatar:', error)
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

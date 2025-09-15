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
    
    // If filename already includes the "avatars/" prefix, remove it to avoid double prefix
    // The Supabase storage bucket is already "avatars", so we don't need the prefix
    if (filename.startsWith('avatars/')) {
      filePath = filename.substring(7) // Remove "avatars/" prefix
    }
    
    // Debug logging
    console.log('Avatar request:', { originalFilename: filename, filePath })
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .download(filePath)

    if (error) {
      // Only log errors for valid-looking filenames to reduce noise
      if (filename.length > 10) {
        console.error('Error downloading avatar:', { filename, filePath, error })
      }
      
      // Return a default avatar instead of 404
      // This prevents broken image icons from showing
      const defaultAvatar = `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" fill="#374151"/>
          <circle cx="50" cy="35" r="15" fill="#6B7280"/>
          <path d="M20 85 Q20 70 50 70 Q80 70 80 85" fill="#6B7280"/>
        </svg>
      `
      return new NextResponse(defaultAvatar, { 
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        }
      })
    }

    // Convert blob to buffer
    const buffer = await data.arrayBuffer()

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache instead of 1 year
        'Access-Control-Allow-Origin': '*', // Allow cross-origin access
      },
    })
  } catch (error) {
    console.error('Error serving avatar:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

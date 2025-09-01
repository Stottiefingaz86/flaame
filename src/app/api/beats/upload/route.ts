import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const artist = formData.get('artist') as string
    const description = formData.get('description') as string
    const bpm = parseInt(formData.get('bpm') as string) || null
    const key = formData.get('key') as string
    const genre = formData.get('genre') as string
    const costFlames = parseInt(formData.get('costFlames') as string) || 0
    const isFree = formData.get('isFree') === 'true'
    const isOriginal = formData.get('isOriginal') === 'true'
    const audioFile = formData.get('audioFile') as File

    // Validate required fields
    if (!title || !artist || !audioFile) {
      return NextResponse.json({ error: 'Title, artist, and audio file are required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'video/mp4', 'video/quicktime']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only MP3, WAV, AAC, MP4, and MOV files are allowed.' }, { status: 400 })
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 100MB.' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = audioFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('File upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    // Create beat record in database
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .insert({
        title,
        artist,
        description,
        bpm,
        key,
        genre,
        cost_flames: isFree ? 0 : costFlames,
        is_free: isFree,
        is_original: isOriginal,
        copyright_verified: isOriginal, // Auto-verify original content
        file_path: fileName,
        file_size: audioFile.size,
        uploader_id: user.id
      })
      .select()
      .single()

    if (beatError) {
      console.error('Beat creation error:', beatError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('beats').remove([fileName])
      return NextResponse.json({ error: 'Failed to create beat record' }, { status: 500 })
    }

    // If not original content, create copyright verification request
    if (!isOriginal) {
      await supabase
        .from('copyright_verifications')
        .insert({
          beat_id: beat.id,
          status: 'pending',
          notes: 'Pending copyright verification for uploaded content'
        })
    }

    return NextResponse.json({ 
      success: true, 
      beat,
      publicUrl,
      message: isOriginal ? 'Beat uploaded successfully!' : 'Beat uploaded! Pending copyright verification.'
    })

  } catch (error) {
    console.error('Beat upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

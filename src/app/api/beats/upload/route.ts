import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('Beat upload request started')
    
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
    console.log('Auth check:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      console.log('Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isFree = formData.get('isFree') === 'true'
    const flaamesPrice = parseInt(formData.get('flaamesPrice') as string) || 0
    const audioFile = formData.get('audioFile') as File

    console.log('Form data received:', { 
      title, 
      description, 
      isFree, 
      flaamesPrice, 
      fileName: audioFile?.name, 
      fileSize: audioFile?.size,
      fileType: audioFile?.type
    })

    // Validate required fields
    if (!title || !audioFile) {
      console.log('Validation failed: missing title or audio file')
      return NextResponse.json({ error: 'Title and audio file are required' }, { status: 400 })
    }

    // Validate file size (50MB limit for beats bucket)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (audioFile.size > maxSize) {
      console.log('File too large:', audioFile.size, 'bytes')
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac', 'video/mp4', 'video/quicktime']
    if (!allowedTypes.includes(audioFile.type)) {
      console.log('Invalid file type:', audioFile.type)
      return NextResponse.json({ error: 'Invalid file type. Please upload an audio file (MP3, WAV, FLAC, AAC, MP4, MOV)' }, { status: 400 })
    }

    console.log('All validations passed, proceeding with upload...')

    // Upload file to Supabase Storage - using 'beats' bucket
    const fileName = `${Date.now()}-${audioFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('beats')
      .upload(fileName, audioFile)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    console.log('File uploaded to storage:', uploadData)

    // Get public URL from 'beats' bucket
    const { data: urlData } = supabase.storage
      .from('beats')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl
    console.log('Public URL generated:', publicUrl)

    // Create beat record in database
    const { data: beatData, error: insertError } = await supabase
      .from('beats')
      .insert({
        title,
        description,
        artist: user.email?.split('@')[0] || 'Unknown Artist',
        audio_url: publicUrl,
        file_name: fileName,
        file_size: audioFile.size,
        file_type: audioFile.type,
        is_free: isFree,
        flaames_price: flaamesPrice,
        producer_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('beats').remove([fileName])
      return NextResponse.json({ error: 'Failed to save beat record' }, { status: 500 })
    }

    console.log('Beat record created:', beatData)

    const response = { 
      success: true, 
      message: 'Beat uploaded successfully!',
      beat: beatData
    }
    
    console.log('Sending success response:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Beat upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


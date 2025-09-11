import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.INSTAGRAM_CLIENT_SECRET
const REDIRECT_URI = (process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co') + '/api/auth/facebook/callback'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_reason = searchParams.get('error_reason')
  const error_description = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Facebook OAuth error:', { error, error_reason, error_description })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth?error=facebook_oauth_failed&reason=${error_reason || 'unknown'}`
    )
  }

  // Initial OAuth redirect
  if (!code) {
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    authUrl.searchParams.set('client_id', FACEBOOK_CLIENT_ID!)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('scope', 'public_profile')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', 'flame_battles_auth')

    return NextResponse.redirect(authUrl.toString())
  }

  // Handle OAuth callback
  try {
    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', FACEBOOK_CLIENT_ID!)
    tokenUrl.searchParams.set('client_secret', FACEBOOK_CLIENT_SECRET!)
    tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    tokenUrl.searchParams.set('code', code)

    const tokenRes = await fetch(tokenUrl.toString())
    
    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.statusText}`)
    }

    const tokenData = await tokenRes.json()
    const { access_token } = tokenData

    // Get user profile from Facebook
    const profileUrl = new URL('https://graph.facebook.com/v18.0/me')
    profileUrl.searchParams.set('fields', 'id,name')
    profileUrl.searchParams.set('access_token', access_token)

    const profileResponse = await fetch(profileUrl.toString())

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.statusText}`)
    }

    const profileData = await profileResponse.json()
    const { id: facebook_id, name } = profileData

    // Create Supabase client
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

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('facebook_id', facebook_id)
      .single()

    if (existingUser) {
      // User exists, redirect to home (they're already logged in via Facebook)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/?auth=success&username=${existingUser.username}`)
    }

    // Create new user
    const username = name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${facebook_id}@facebook.com`,
      password: 'facebook_oauth_' + facebook_id + '_' + Date.now(),
      options: {
        data: {
          username: username,
          facebook_id: facebook_id
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth?error=auth_failed`)
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username: username,
            email: `${facebook_id}@facebook.com`,
            facebook_id: facebook_id,
            flames: 100, // Starting flames
            rank: 'Rising'
          }
        ])

      if (profileError) {
        console.error('Profile error:', profileError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth?error=profile_failed`)
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/`)

  } catch (error) {
    console.error('Facebook OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://flaame.co'}/auth?error=oauth_failed`)
  }
}


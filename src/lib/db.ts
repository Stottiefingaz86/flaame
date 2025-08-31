import { createServerClient } from './supabase'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient()
}

export type Battle = {
  id: string
  title: string
  description?: string
  status: 'ACTIVE' | 'VOTING' | 'CLOSED'
  created_at: string
  ends_at: string
  winner_id?: string
  total_votes: number
}

export type BattleEntry = {
  id: string
  battle_id: string
  user_id: string
  beat_id: string
  audio_url: string
  lyrics?: string
  created_at: string
  user: {
    username: string
    avatar_id?: string
    profile_color?: string
    profile_icon?: string
  }
  beat: {
    title: string
    artist: string
    cost_flames: number
  }
}

export type Vote = {
  id: string
  battle_id: string
  voter_id: string
  entry_id: string
  weight: number
  created_at: string
}

export type Profile = {
  id: string
  username: string
  flames_balance: number
  avatar_id?: string
  profile_color?: string
  profile_icon?: string
  created_at: string
}

export type Avatar = {
  id: string
  name: string
  image_url: string
  cost_flames: number
  created_at: string
}

export type Beat = {
  id: string
  title: string
  artist: string
  audio_url: string
  cost_flames: number
  created_at: string
}

export type Sponsor = {
  id: string
  name: string
  logo_url?: string
  link_url?: string
  created_at: string
}

export type BattleSponsor = {
  battle_id: string
  sponsor_id: string
  slot: 'hero' | 'sidebar' | 'footer'
  priority: number
  sponsor: Sponsor
}

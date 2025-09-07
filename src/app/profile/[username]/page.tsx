'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Flame, 
  Crown, 
  Music, 
  Heart,
  Camera,
  Trophy,
  Award,
  TrendingUp,
  Play,
  Pause,
  Download,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useAudio } from '@/contexts/AudioContext'
import ViewBeatCard from '@/components/profile/ViewBeatCard'
import { denormalizeUsernameFromUrl, normalizeUsernameForUrl } from '@/lib/utils'

interface User {
  id: string
  username: string
  bio?: string
  avatar_id?: string
  total_flames: number
  league: string
  wins: number
  losses: number
  draws: number
  created_at: string
  instagram_url?: string
  spotify_url?: string
}

interface Battle {
  id: string
  title: string
  status: string
  created_at: string
  opponent_username?: string
  result?: string
}

interface Beat {
  id: string
  title: string
  description: string
  genre: string
  is_free: boolean
  cost_flames?: number
  download_count: number
  like_count: number
  created_at: string
  audio_url: string
  duration?: number
}

export default function UserProfilePage() {
  const params = useParams()
  const urlUsername = params.username as string
  const username = denormalizeUsernameFromUrl(urlUsername)
  const { user: currentUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [similarUsernames, setSimilarUsernames] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'battles' | 'beats' | 'achievements'>('battles')
  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudio()


  useEffect(() => {
    if (urlUsername) {
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [urlUsername])

  // Get battle style from title (same logic as arena)
  const getBattleStyle = (title: string) => {
    if (title.toLowerCase().includes('flame')) {
      return { type: 'Flame', emoji: '🔥', color: 'bg-red-500/10 text-red-300 border-red-500/20' }
    } else if (title.toLowerCase().includes('freestyle')) {
      return { type: 'Freestyle', emoji: '🎤', color: 'bg-green-500/10 text-green-300 border-green-500/20' }
    } else if (title.toLowerCase().includes('story')) {
      return { type: 'Story', emoji: '📖', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' }
    } else {
      return { type: 'Battle', emoji: '⚔️', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' }
    }
  }

  // Format time remaining
  const formatTimeLeft = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m`
    return 'Ending soon'
  }

  const loadUserBattles = async (userId: string) => {
    try {
      console.log('=== LOADING BATTLES FOR USER ===')
      console.log('User ID:', userId)
      
      // Simplified query to just get battles first
      const { data: battlesData, error: battlesError } = await supabase
        .from('battles')
        .select(`
          *,
          challenger:profiles!battles_challenger_id_fkey(id, username, avatar_id, flames),
          opponent:profiles!battles_opponent_id_fkey(id, username, avatar_id, flames)
        `)
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      console.log('Battles query result:', { battlesData, battlesError })

      if (battlesError) {
        console.error('Error loading battles:', battlesError)
        setBattles([])
        return
      }

      if (!battlesData || battlesData.length === 0) {
        console.log('No battles found for user:', userId)
        setBattles([])
        return
      }

      console.log('Found', battlesData.length, 'battles')
      console.log('Setting battles to:', battlesData)
      setBattles(battlesData)
    } catch (error) {
      console.error('Error loading battles:', error)
      setBattles([])
    }
  }

  const loadUserBeats = async (userId: string) => {
    try {
      console.log('Loading beats for user:', userId)
      const { data: beatsData, error: beatsError } = await supabase
        .from('beats')
        .select('*')
        .eq('uploader_id', userId)
        .order('created_at', { ascending: false })

      if (beatsError) {
        console.error('Error loading beats:', beatsError)
        setBeats([])
      } else {
        console.log('Loaded beats:', beatsData)
        setBeats(beatsData || [])
      }
    } catch (error) {
      console.error('Error loading beats:', error)
      setBeats([])
    }
  }

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Use the API endpoint instead of direct Supabase query
      const response = await fetch(`/api/profile/user-by-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()

      if (!result.success || !result.user) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // Map the API response to our User interface
      const userData = {
        id: result.user.id,
        username: result.user.username,
        bio: result.user.bio || '',
        avatar_id: result.user.avatar_id,
        total_flames: result.user.flames || 0,
        league: result.user.rank || 'Rookie',
        wins: result.user.wins || 0,
        losses: result.user.losses || 0,
        draws: result.user.draws || 0,
        created_at: result.user.created_at || new Date().toISOString(),
        instagram_username: result.user.instagram_username,
        spotify_url: result.user.spotify_url
      }

      setUser(userData)
      setIsLoading(false) // Set loading to false immediately after setting user

      // Load user's battles and beats after setting user
      try {
        console.log('Profile page - About to load battles for user ID:', result.user.id)
        await loadUserBattles(result.user.id)
        await loadUserBeats(result.user.id)
        console.log('Profile page - Finished loading battles and beats')
      } catch (error) {
        console.error('Error loading battles/beats:', error)
        // Continue even if battles/beats fail to load
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
      setIsLoading(false)
    }
  }, [username])

  const handleDownload = async (beat: Beat) => {
    // Check if user is authenticated
    if (!currentUser) {
      // Redirect to auth page with signup mode
      window.location.href = '/auth?mode=signup'
      return
    }

    if (!beat.is_free && currentUser?.total_flames < beat.cost_flames!) {
      alert('Not enough flames to download this beat!')
      return
    }

    // Here you would implement the download logic
    console.log('Downloading beat:', beat.title)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading profile...</p>
          <p className="text-gray-400 text-sm mt-2">Username: {username}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-gray-400 mb-6">
            The user "{username}" doesn't exist.
          </p>
          
          {similarUsernames.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-300 mb-4">Did you mean one of these?</p>
              <div className="space-y-2">
                {similarUsernames.map((similarUsername) => (
                  <Link 
                    key={similarUsername}
                    href={`/profile/${normalizeUsernameForUrl(similarUsername)}`}
                    className="block bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-white transition-colors"
                  >
                    {similarUsername}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <Link href="/leaderboard">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Browse All Users
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <div className="relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-purple-500/20 rounded-2xl" />
            
            <Card className="relative bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar with Glow Effect */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-30 scale-110" />
                    <Avatar className="relative w-24 h-24 border-2 border-white/30 shadow-xl">
                      <AvatarImage 
                        src={user.avatar_id ? `/api/avatars/${encodeURIComponent(user.avatar_id)}` : undefined} 
                        alt={user.username} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-3xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.username === 'Flaame' && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg">
                        <Crown className="w-6 h-6 text-black" />
                      </div>
                    )}
                  </div>

                  {/* Username and Verification */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        {user.username}
                        {user.username === 'Flaame' && (
                          <div className="flex items-center gap-1">
                            <Crown className="w-6 h-6 text-yellow-400" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
                      </h1>
                    </div>
                    
                    {/* League Badge */}
                    <div className="flex justify-center">
                      <Badge className={`
                        px-4 py-2 text-sm font-semibold shadow-lg
                        ${user.league === 'Legendary' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-0' :
                          user.league === 'Veteran' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0' :
                          'bg-gradient-to-r from-green-400 to-green-600 text-white border-0'}
                      `}>
                        {user.league}
                      </Badge>
                    </div>
                    
                    {user.bio && (
                      <p className="text-gray-300 text-base max-w-md leading-relaxed">{user.bio}</p>
                    )}
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-4 gap-6 w-full max-w-md">
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-xl font-bold text-white">{user.total_flames || 0}</span>
                      </div>
                      <p className="text-gray-400 text-xs font-medium">Flames</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="text-xl font-bold text-green-400 mb-2">{user.wins || 0}</div>
                      <p className="text-gray-400 text-xs font-medium">Wins</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="text-xl font-bold text-red-400 mb-2">{user.losses || 0}</div>
                      <p className="text-gray-400 text-xs font-medium">Losses</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="text-xl font-bold text-yellow-400 mb-2">{user.draws || 0}</div>
                      <p className="text-gray-400 text-xs font-medium">Draws</p>
                    </div>
                  </div>

                  {/* Enhanced Social Links */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {user.instagram_username ? (
                      <Button
                        variant="ghost"
                        asChild
                        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 hover:border-pink-400/30 transition-all duration-300"
                      >
                        <a 
                          href={`https://instagram.com/${user.instagram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span className="text-sm font-medium">@{user.instagram_username}</span>
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span className="text-sm">No Instagram linked</span>
                      </Button>
                    )}
                    
                    {user.spotify_url ? (
                      <Button
                        variant="ghost"
                        asChild
                        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-green-400 hover:text-green-300 hover:bg-green-500/10 hover:border-green-400/30 transition-all duration-300"
                      >
                        <a 
                          href={user.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Music className="w-4 h-4" />
                          <span className="text-sm font-medium">Spotify</span>
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-all duration-300"
                      >
                        <Music className="w-4 h-4" />
                        <span className="text-sm">No Spotify linked</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden">
            <div className="grid w-full grid-cols-3 bg-black/20 border-white/10 mb-6 rounded-lg">
              <button
                onClick={() => setActiveTab('battles')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  activeTab === 'battles'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Battles
              </button>
              <button
                onClick={() => setActiveTab('beats')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'beats'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Beats
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  activeTab === 'achievements'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Achievements
              </button>
            </div>

            {/* Mobile Tab Content */}
            <div className="mt-6">
              {activeTab === 'battles' && (
                <>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Loading battles...</p>
                    </div>
                  ) : battles.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No battles yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {battles.map((battle) => (
                        <Link key={battle.id} href={`/battle/${battle.id}`}>
                          <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 cursor-pointer">
                            {/* Timer and Tags */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="ghost" className="bg-white/5 text-white/70 border-white/20 px-3 py-1 text-xs flex items-center gap-2">
                                    <span>🇺🇸</span>
                                    <span>{getBattleStyle(battle.title).type}</span>
                                  </Badge>
                                  <Badge variant="ghost" className={`px-3 py-1 text-xs font-medium ${
                                    battle.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                    battle.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                                    battle.status === 'closed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' :
                                    'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                  }`}>
                                    {battle.status === 'pending' ? 'Open' : 
                                     battle.status === 'active' ? 'Active' :
                                     battle.status === 'closed' ? 'Finished' : 
                                     battle.status}
                                  </Badge>
                                </div>
                                {battle.ends_at && battle.status !== 'closed' && (
                                  <div className="text-xs text-orange-400 font-medium bg-orange-500/10 px-2 py-1 rounded">
                                    {formatTimeLeft(battle.ends_at)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* VS Section */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between">
                                {/* Challenger */}
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                                    {battle.challenger?.avatar_id ? (
                                      <img
                                        src={`/api/avatars/${battle.challenger.avatar_id}`}
                                        alt={battle.challenger.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      battle.challenger?.username?.charAt(0).toUpperCase() || '?'
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium text-sm">{battle.challenger?.username || 'Unknown'}</div>
                                  </div>
                                </div>

                                {/* VS */}
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                                  <span className="text-white font-bold text-xs">VS</span>
                                </div>

                                {/* Opponent */}
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {battle.opponent?.avatar_id ? (
                                      <img
                                        src={`/api/avatars/${battle.opponent.avatar_id}`}
                                        alt={battle.opponent.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : battle.opponent ? (
                                      battle.opponent.username?.charAt(0).toUpperCase() || '?'
                                    ) : (
                                      <span className="text-xs">?</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium text-sm">
                                      {battle.opponent?.username || 'Waiting...'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {battle.opponent ? 'Opponent' : 'No opponent yet'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'beats' && (
                <>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Loading beats...</p>
                    </div>
                  ) : beats.length === 0 ? (
                    <div className="text-center py-8">
                      <Music className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No beats uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {beats.map((beat) => (
                        <div key={beat.id} className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-black/30 transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white text-lg font-semibold mb-1">{beat.title}</h3>
                              <p className="text-gray-300 text-sm mb-3">{beat.description}</p>
                              
                              {/* Stats */}
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {beat.like_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Music className="w-3 h-3" />
                                  {beat.download_count || 0}
                                </span>
                                <span>
                                  {new Date(beat.created_at).toLocaleDateString('en-US', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10"
                                onClick={() => {
                                  if (beat.audio_url) {
                                    playTrack({
                                      id: beat.id,
                                      title: beat.title,
                                      artist: user?.username || 'Unknown Artist',
                                      audioUrl: beat.audio_url,
                                      duration: beat.duration || 0,
                                      username: user?.username,
                                      avatarId: user?.avatar_id
                                    })
                                  }
                                }}
                              >
                                <Play className="w-4 h-4 text-white" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10"
                                onClick={async () => {
                                  // Check if user is authenticated
                                  if (!currentUser) {
                                    // Redirect to auth page with signup mode
                                    window.location.href = '/auth?mode=signup'
                                    return
                                  }

                                  try {
                                    const response = await fetch(beat.audio_url)
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `${beat.title}.wav`
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                    document.body.removeChild(a)
                                  } catch (error) {
                                    console.error('Download failed:', error)
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 text-white" />
                              </Button>
                              <Badge className="bg-white text-black text-xs px-2 py-1">
                                {beat.is_free ? 'Free' : `${beat.cost_flames} Flaames`}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'achievements' && (
                <div className="text-center py-8">
                  <Award className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Achievements coming soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="w-full hidden md:block">
            <div className="grid w-full grid-cols-3 bg-black/20 border-white/10 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('battles')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  activeTab === 'battles'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Battle History
              </button>
              <button
                onClick={() => setActiveTab('beats')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'beats'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Beats
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  activeTab === 'achievements'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Achievements
              </button>
            </div>

            {/* Desktop Tab Content */}
            <div className="mt-6">
              {activeTab === 'battles' && (
                <Card className="bg-black/20 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Recent Battles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading battles...</p>
                      </div>
                    ) : battles.length === 0 ? (
                      <div className="text-center py-8">
                        <Trophy className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No battles yet</p>
                        <p className="text-gray-400 text-xs mt-2">Debug: battles array length = {battles.length}</p>
                        <p className="text-gray-400 text-xs">Loading state: {isLoading ? 'true' : 'false'}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {battles.map((battle) => (
                          <Link key={battle.id} href={`/battle/${battle.id}`}>
                            <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 cursor-pointer">
                              {/* Timer and Tags */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="ghost" className="bg-white/5 text-white/70 border-white/20 px-3 py-1 text-xs flex items-center gap-2">
                                      <span>🇺🇸</span>
                                      <span>{getBattleStyle(battle.title).type}</span>
                                    </Badge>
                                    <Badge variant="ghost" className={`px-3 py-1 text-xs font-medium ${
                                      battle.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                      battle.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                                      battle.status === 'closed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' :
                                      'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                    }`}>
                                      {battle.status === 'pending' ? 'Open' : 
                                       battle.status === 'active' ? 'Active' :
                                       battle.status === 'closed' ? 'Finished' : 
                                       battle.status}
                                    </Badge>
                                  </div>
                                  {battle.ends_at && battle.status !== 'closed' && (
                                    <div className="text-xs text-orange-400 font-medium bg-orange-500/10 px-2 py-1 rounded">
                                      {formatTimeLeft(battle.ends_at)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* VS Section */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between">
                                  {/* Challenger */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                                      {battle.challenger?.avatar_id ? (
                                        <img
                                          src={`/api/avatars/${battle.challenger.avatar_id}`}
                                          alt={battle.challenger.username}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        battle.challenger?.username?.charAt(0).toUpperCase() || '?'
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium text-sm">{battle.challenger?.username || 'Unknown'}</div>
                                    </div>
                                  </div>

                                  {/* VS */}
                                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2">
                                    <span className="text-orange-400 font-bold text-sm">VS</span>
                                  </div>

                                  {/* Opponent */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                      {battle.opponent?.avatar_id ? (
                                        <img
                                          src={`/api/avatars/${battle.opponent.avatar_id}`}
                                          alt={battle.opponent.username}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : battle.opponent ? (
                                        battle.opponent.username?.charAt(0).toUpperCase() || '?'
                                      ) : (
                                        <span className="text-xs">?</span>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium text-sm">
                                        {battle.opponent?.username || 'Waiting...'}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {battle.opponent ? 'Opponent' : 'No opponent yet'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'beats' && (
                <Card className="bg-black/20 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-purple-400" />
                      Beats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading beats...</p>
                      </div>
                    ) : beats.length === 0 ? (
                      <div className="text-center py-8">
                        <Music className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No beats uploaded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {beats.map((beat) => (
                          <div key={beat.id} className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-black/30 transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white text-lg font-semibold mb-1">{beat.title}</h3>
                                <p className="text-gray-300 text-sm mb-3">{beat.description}</p>
                                
                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {beat.like_count || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Music className="w-3 h-3" />
                                    {beat.download_count || 0}
                                  </span>
                                  <span>
                                    {new Date(beat.created_at).toLocaleDateString('en-US', { 
                                      month: '2-digit', 
                                      day: '2-digit', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10"
                                  onClick={() => {
                                    if (beat.audio_url) {
                                      playTrack({
                                        id: beat.id,
                                        title: beat.title,
                                        artist: user?.username || 'Unknown Artist',
                                        audioUrl: beat.audio_url,
                                        duration: beat.duration || 0,
                                        username: user?.username,
                                        avatarId: user?.avatar_id
                                      })
                                    }
                                  }}
                                >
                                  <Play className="w-4 h-4 text-white" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10"
                                  onClick={async () => {
                                    // Check if user is authenticated
                                    if (!currentUser) {
                                      // Redirect to auth page with signup mode
                                      window.location.href = '/auth?mode=signup'
                                      return
                                    }

                                    try {
                                      const response = await fetch(beat.audio_url)
                                      const blob = await response.blob()
                                      const url = window.URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = `${beat.title}.wav`
                                      document.body.appendChild(a)
                                      a.click()
                                      window.URL.revokeObjectURL(url)
                                      document.body.removeChild(a)
                                    } catch (error) {
                                      console.error('Download failed:', error)
                                    }
                                  }}
                                >
                                  <Download className="w-4 h-4 text-white" />
                                </Button>
                                <Badge className="bg-white text-black text-xs px-2 py-1">
                                  {beat.is_free ? 'Free' : `${beat.cost_flames} Flaames`}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'achievements' && (
                <Card className="bg-black/20 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Achievements coming soon!</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
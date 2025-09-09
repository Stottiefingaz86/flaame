'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  Music, 
  Heart, 
  Download, 
  TrendingUp,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Mic,
  MapPin,
  Users,
  Award,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAudio } from '@/contexts/AudioContext'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import { normalizeUsernameForUrl } from '@/lib/utils'
import StyledUsername from '@/components/ui/StyledUsername'

interface FeaturedArtist {
  id: string
  username: string
  avatar_id?: string
  location?: string
  total_battles: number
  total_wins: number
  total_points: number
  most_popular_battle?: {
    id: string
    title: string
    audio_url: string
    like_count: number
    view_count: number
    duration?: number
  }
}

interface Artist {
  id: string
  username: string
  avatar_id?: string
  total_battles: number
  total_wins: number
  total_points: number
  engagement_score: number
}

export default function FeaturedArtist() {
  const [featuredArtist, setFeaturedArtist] = useState<FeaturedArtist | null>(null)
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedBattles, setLikedBattles] = useState<Set<string>>(new Set())
  const [localLikeCount, setLocalLikeCount] = useState(0)
  const [localViewCount, setLocalViewCount] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const { playAudio, pauseAudio, currentTrackUrl, isPlaying } = useAudio()
  const { user } = useUser()

  useEffect(() => {
    loadFeaturedArtist()
  }, [])

  // Check like status when user or featured artist changes
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !featuredArtist?.most_popular_battle) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('battle_likes')
          .select('*')
          .eq('battle_id', featuredArtist.most_popular_battle.id)
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          setLikedBattles(prev => {
            const newSet = new Set(prev)
            newSet.delete(featuredArtist.most_popular_battle.id)
            return newSet
          })
          return
        }

        if (data) {
          setLikedBattles(prev => new Set(prev).add(featuredArtist.most_popular_battle.id))
        } else {
          setLikedBattles(prev => {
            const newSet = new Set(prev)
            newSet.delete(featuredArtist.most_popular_battle.id)
            return newSet
          })
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    checkLikeStatus()
  }, [user, featuredArtist?.most_popular_battle?.id])

  // Update local counts when featured artist changes
  useEffect(() => {
    if (featuredArtist?.most_popular_battle) {
      setLocalLikeCount(featuredArtist.most_popular_battle.like_count || 0)
      setLocalViewCount(featuredArtist.most_popular_battle.view_count || 0)
    }
  }, [featuredArtist?.most_popular_battle])

  const loadFeaturedArtist = async () => {
    try {
      setIsLoading(true)
      
      // Using Fletchy's actual data from the original content
      const fletchyData: FeaturedArtist = {
        id: 'fletchy-id',
        username: 'fletchy',
        avatar_id: 'Fletchy-by-Little-Large-Media.jpeg',
        location: 'Newcastle, UK',
        total_battles: 12,
        total_wins: 8,
        total_points: 2450,
        most_popular_battle: {
          id: 'battle-1',
          title: 'Shangri-La Freestyle',
          audio_url: '/api/placeholder-audio',
          like_count: 156,
          view_count: 2340,
          duration: 120
        }
      }

      const mockArtists: Artist[] = [
        { id: 'artist-1', username: 'fletchy', avatar_id: 'fletchy-avatar', total_battles: 12, total_wins: 8, total_points: 2450, engagement_score: 95 },
        { id: 'artist-2', username: 'mcflow', avatar_id: 'mcflow-avatar', total_battles: 15, total_wins: 9, total_points: 2200, engagement_score: 88 },
        { id: 'artist-3', username: 'rhymeking', avatar_id: 'rhymeking-avatar', total_battles: 10, total_wins: 6, total_points: 1800, engagement_score: 82 },
        { id: 'artist-4', username: 'wordmaster', avatar_id: 'wordmaster-avatar', total_battles: 8, total_wins: 5, total_points: 1650, engagement_score: 78 },
        { id: 'artist-5', username: 'battlebeast', avatar_id: 'battlebeast-avatar', total_battles: 20, total_wins: 12, total_points: 2100, engagement_score: 75 }
      ]

      setFeaturedArtist(fletchyData)
      setArtists(mockArtists)
    } catch (error) {
      console.error('Failed to load featured artist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayTrack = async (audioUrl: string, trackName: string, username?: string) => {
    try {
      // Check if this track is currently playing
      if (currentTrackUrl === audioUrl && isPlaying) {
        pauseAudio()
      } else {
        // Play the track
        playAudio(audioUrl, trackName, username, featuredArtist?.avatar_id)
      }
    } catch (error) {
      console.error('Error playing track:', error)
    }
  }

  const handleDownloadBattle = async (audioUrl: string, title: string, username: string) => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to auth page with signup mode
      window.location.href = '/auth?mode=signup'
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title} - ${username}.wav`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update view count in database (when battles are implemented)
      if (featuredArtist?.most_popular_battle) {
        setLocalViewCount(prev => prev + 1)
        // Update the featured artist state
        setFeaturedArtist(prev => {
          if (prev?.most_popular_battle) {
            return {
              ...prev,
              most_popular_battle: {
                ...prev.most_popular_battle,
                view_count: (prev.most_popular_battle.view_count || 0) + 1
              }
            }
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleLikeBattle = async (battleId: string) => {
    if (!user) {
      window.location.href = '/auth?mode=signup'
      return
    }

    try {
      const isLiked = likedBattles.has(battleId)
      
      if (isLiked) {
        // Unlike the battle
        const { error } = await supabase
          .from('battle_likes')
          .delete()
          .eq('battle_id', battleId)
          .eq('user_id', user.id)

        if (error) throw error
        
        setLikedBattles(prev => {
          const newSet = new Set(prev)
          newSet.delete(battleId)
          return newSet
        })
        setLocalLikeCount(prev => Math.max(0, prev - 1))
      } else {
        // Like the battle
        const { error } = await supabase
          .from('battle_likes')
          .insert({
            battle_id: battleId,
            user_id: user.id
          })

        if (error) throw error
        
        setLikedBattles(prev => new Set(prev).add(battleId))
        setLocalLikeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading || !featuredArtist) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Mic className="w-8 h-8 text-white" />
          Featured Artist
        </h2>
      </div>

      {/* Featured Artist Card - Clean Style */}
      <div className="group bg-transparent backdrop-blur-2xl border border-white/10 overflow-hidden hover:bg-white/5 transition-all duration-500 shadow-2xl hover:shadow-white/20 hover:scale-[1.01] rounded-lg">
        <div className="p-6">
          {/* Top: Artist Info with Avatar */}
          <div className="flex items-start gap-4 mb-4">
            <Link href={`/profile/${normalizeUsernameForUrl(featuredArtist.username)}`}>
              <Avatar className="h-14 w-14 border border-white/20 hover:border-white/40 transition-all duration-300">
                <AvatarImage src={`/api/avatars/${featuredArtist.avatar_id}`} alt={featuredArtist.username} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-gray-700 to-gray-900">
                  {featuredArtist.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${normalizeUsernameForUrl(featuredArtist.username)}`}>
                <StyledUsername 
                  username={featuredArtist.username} 
                  userId={featuredArtist.id}
                  className="text-white text-base font-medium hover:text-gray-200 transition-colors"
                />
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-sm text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured Artist
                </Badge>
                {featuredArtist.location && (
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {featuredArtist.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Artist Description */}
          <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-200 transition-colors">
            North East rapper Fletchy brings authentic hip-hop that speaks to the essence of what the genre 
            has always been: escapism and the power of words. His latest album "Shangri-La" is a love letter 
            to hip-hop, featuring production from Stottie Fingaz.
          </p>

          {/* Artist Quote */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
            <p className="text-orange-400 font-semibold italic text-sm">
              "When I put my pen to the pad I'm subconsciously escaping, nothing else matters at that moment in time, it's pure bliss."
            </p>
            <cite className="text-gray-400 text-xs">— Fletchy</cite>
          </div>

          {/* Artist Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Music className="w-4 h-4" />
              <span>84 Monthly Listeners</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              <span>169 Followers</span>
            </div>
          </div>


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
            <a 
              href="https://open.spotify.com/artist/4vShBjt1fl5s35OJg22knZ?si=8HvAJalERmy7TmCU9ucbrw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Play className="w-4 h-4" />
              Listen on Spotify
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link href="/blog/artist-spotlight-fletchy">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 text-sm">
                Read Full Story
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

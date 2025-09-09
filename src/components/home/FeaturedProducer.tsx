'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Crown, 
  Music, 
  Heart, 
  Download, 
  TrendingUp,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Disc,
  Disc3,
  Vinyl
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAudio } from '@/contexts/AudioContext'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import { normalizeUsernameForUrl } from '@/lib/utils'
import StyledUsername from '@/components/ui/StyledUsername'

interface FeaturedProducer {
  id: string
  username: string
  avatar_id?: string
  total_likes: number
  total_downloads: number
  total_beats: number
  most_popular_beat?: {
    id: string
    title: string
    audio_url: string
    like_count: number
    download_count: number
    duration?: number
  }
}

interface Producer {
  id: string
  username: string
  avatar_id?: string
  total_likes: number
  total_downloads: number
  total_beats: number
  engagement_score: number
}

export default function FeaturedProducer() {
  const [featuredProducer, setFeaturedProducer] = useState<FeaturedProducer | null>(null)
  const [producers, setProducers] = useState<Producer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedBeats, setLikedBeats] = useState<Set<string>>(new Set())
  const [localLikeCount, setLocalLikeCount] = useState(0)
  const [localDownloadCount, setLocalDownloadCount] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const { playAudio, pauseAudio, currentTrackUrl, isPlaying } = useAudio()
  const { user } = useUser()

  useEffect(() => {
    loadFeaturedProducer()
  }, [])

  // Check like status when user or featured producer changes
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !featuredProducer?.most_popular_beat) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('beat_likes')
          .select('*')
          .eq('beat_id', featuredProducer.most_popular_beat.id)
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          setLikedBeats(prev => {
            const newSet = new Set(prev)
            newSet.delete(featuredProducer.most_popular_beat.id)
            return newSet
          })
          return
        }

        if (data) {
          setLikedBeats(prev => new Set(prev).add(featuredProducer.most_popular_beat.id))
        } else {
          setLikedBeats(prev => {
            const newSet = new Set(prev)
            newSet.delete(featuredProducer.most_popular_beat.id)
            return newSet
          })
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    checkLikeStatus()
  }, [user, featuredProducer?.most_popular_beat?.id])

  // Update local counts when featured producer changes
  useEffect(() => {
    if (featuredProducer?.most_popular_beat) {
      setLocalLikeCount(featuredProducer.most_popular_beat.like_count || 0)
      setLocalDownloadCount(featuredProducer.most_popular_beat.download_count || 0)
    }
  }, [featuredProducer?.most_popular_beat])

  const handlePlayTrack = async (audioUrl: string, trackName: string, username?: string) => {
    try {
      // Check if this track is currently playing
      if (currentTrackUrl === audioUrl && isPlaying) {
        pauseAudio()
      } else {
        // Play the track
        playAudio(audioUrl, trackName, username, featuredProducer?.avatar_id)
      }
    } catch (error) {
      console.error('Error playing track:', error)
    }
  }

  const handleDownloadBeat = async (audioUrl: string, title: string, username: string) => {
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

      // Update download count in database
      if (featuredProducer?.most_popular_beat) {
        const { error } = await supabase
          .from('beats')
          .update({ download_count: (featuredProducer.most_popular_beat.download_count || 0) + 1 })
          .eq('id', featuredProducer.most_popular_beat.id)

        if (error) {
          console.error('Error updating download count:', error)
        } else {
          // Update local state
          setLocalDownloadCount(prev => prev + 1)
          // Update the featured producer state
          setFeaturedProducer(prev => {
            if (prev?.most_popular_beat) {
              return {
                ...prev,
                most_popular_beat: {
                  ...prev.most_popular_beat,
                  download_count: (prev.most_popular_beat.download_count || 0) + 1
                }
              }
            }
            return prev
          })
        }
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleLikeBeat = async (beatId: string) => {
    if (!user) {
      window.location.href = '/auth?mode=signup'
      return
    }

    try {
      const isLiked = likedBeats.has(beatId)
      
      if (isLiked) {
        // Unlike the beat
        const { error } = await supabase
          .from('beat_likes')
          .delete()
          .eq('beat_id', beatId)
          .eq('user_id', user.id)

        if (error) throw error
        
        setLikedBeats(prev => {
          const newSet = new Set(prev)
          newSet.delete(beatId)
          return newSet
        })
        setLocalLikeCount(prev => Math.max(0, prev - 1))
      } else {
        // Like the beat
        const { error } = await supabase
          .from('beat_likes')
          .insert({
            beat_id: beatId,
            user_id: user.id
          })

        if (error) throw error
        
        setLikedBeats(prev => new Set(prev).add(beatId))
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

  const loadFeaturedProducer = async () => {
    try {
      setIsLoading(true)
      
      // Get all beats with producer info
      const { data: beats, error } = await supabase
        .from('beats')
        .select(`
          id,
          title,
          audio_url,
          like_count,
          download_count,
          duration,
          uploader_id,
          profiles!beats_uploader_id_fkey(
            id,
            username,
            avatar_id
          )
        `)
        .not('uploader_id', 'is', null)

      if (error) {
        console.error('Error loading beats:', error)
        return
      }

      if (beats && beats.length > 0) {
        // Group beats by producer and calculate totals
        const producerStats = beats.reduce((acc: any, beat) => {
          const producerId = beat.uploader_id
          if (!acc[producerId]) {
            acc[producerId] = {
              id: producerId,
              username: beat.profiles?.username || 'Unknown',
              avatar_id: beat.profiles?.avatar_id,
              total_likes: 0,
              total_downloads: 0,
              total_beats: 0,
              most_popular_beat: null
            }
          }
          
          acc[producerId].total_likes += beat.like_count || 0
          acc[producerId].total_downloads += beat.download_count || 0
          acc[producerId].total_beats += 1
          
          // Keep track of the most popular beat (highest likes + downloads)
          if (!acc[producerId].most_popular_beat || 
              (beat.like_count + beat.download_count) > 
              (acc[producerId].most_popular_beat.like_count + acc[producerId].most_popular_beat.download_count)) {
            acc[producerId].most_popular_beat = {
              id: beat.id,
              title: beat.title,
              audio_url: beat.audio_url,
              like_count: beat.like_count || 0,
              download_count: beat.download_count || 0,
              duration: beat.duration
            }
          }
          
          return acc
        }, {})

        // Convert to array and add engagement scores
        const producersArray = Object.values(producerStats).map((producer: any) => ({
          ...producer,
          engagement_score: producer.total_likes + producer.total_downloads
        }))

        // Sort by engagement score (likes + downloads)
        producersArray.sort((a: any, b: any) => b.engagement_score - a.engagement_score)

        // Set the top producer as featured
        setFeaturedProducer(producersArray[0])
        
        // Set all producers for the showcase
        setProducers(producersArray)
      }
    } catch (error) {
      console.error('Error loading featured producer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center py-8 text-gray-400">
          Loading featured producer...
        </div>
      </div>
    )
  }

  if (!featuredProducer) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Disc3 className="w-8 h-8 text-white" />
          Leading Producer
        </h2>
      </div>

      {/* Featured Producer Card - Beat Card Style */}
      <div className="group bg-transparent backdrop-blur-2xl border border-white/10 overflow-hidden hover:bg-white/5 transition-all duration-500 shadow-2xl hover:shadow-white/20 hover:scale-[1.01] rounded-lg">
        <div className="p-6">
          {/* Top: Producer Info with Avatar */}
          <div className="flex items-start gap-4 mb-4">
            <Link href={`/profile/${normalizeUsernameForUrl(featuredProducer.username)}`}>
              <Avatar className="h-14 w-14 border border-white/20 hover:border-white/40 transition-all duration-300">
                <AvatarImage src={`/api/avatars/${featuredProducer.avatar_id}`} alt={featuredProducer.username} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-gray-700 to-gray-900">
                  {featuredProducer.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${normalizeUsernameForUrl(featuredProducer.username)}`}>
                <StyledUsername 
                  username={featuredProducer.username} 
                  userId={featuredProducer.id}
                  className="text-white text-base font-medium hover:text-gray-200 transition-colors"
                />
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Top Producer
                </Badge>
              </div>
            </div>
          </div>

          {/* Beat Title */}
          {featuredProducer.most_popular_beat && (
            <h3 className="text-white text-xl font-bold mb-3 group-hover:text-gray-200 transition-colors">
              {featuredProducer.most_popular_beat.title}
            </h3>
          )}

          {/* Producer Stats */}
          <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-200 transition-colors">
            {featuredProducer.total_beats} beats • {featuredProducer.total_likes} likes • {featuredProducer.total_downloads} downloads
          </p>

          {/* Beat Controls with Waveform */}
          {featuredProducer.most_popular_beat && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
              {/* Left: Control Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Button
                  onClick={() => handlePlayTrack(
                    featuredProducer.most_popular_beat.audio_url, 
                    featuredProducer.most_popular_beat.title,
                    featuredProducer.username
                  )}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  size="icon"
                >
                  {currentTrackUrl === featuredProducer.most_popular_beat.audio_url && isPlaying ? (
                    <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  onClick={() => handleDownloadBeat(
                    featuredProducer.most_popular_beat.audio_url,
                    featuredProducer.most_popular_beat.title,
                    featuredProducer.username
                  )}
                  disabled={isDownloading}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                  size="icon"
                >
                  <Download className={`h-4 w-4 sm:h-5 sm:w-5 ${isDownloading ? 'animate-pulse' : ''}`} />
                </Button>

                <Button
                  onClick={() => handleLikeBeat(featuredProducer.most_popular_beat.id)}
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border transition-all duration-300 backdrop-blur-sm ${
                    likedBeats.has(featuredProducer.most_popular_beat.id)
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 hover:bg-pink-500/30'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  size="icon"
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${likedBeats.has(featuredProducer.most_popular_beat.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Right: SoundCloud Style Waveform */}
              <div className="w-full sm:flex-1 h-12 sm:h-16 flex items-center">
                <div className="w-full h-6 sm:h-8 flex items-end justify-start gap-0.5 overflow-hidden">
                  {[...Array(120)].map((_, i) => {
                    const height = Math.sin(i * 0.15) * 0.4 + 0.6 + Math.random() * 0.2
                    return (
                      <div
                        key={i}
                        className="bg-white rounded-sm opacity-90 hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{
                          width: '1px',
                          height: `${height * 100}%`,
                          minHeight: '2px'
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Beat Stats */}
          {featuredProducer.most_popular_beat && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs text-gray-400 bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
                  <Download className="h-3 w-3" />
                  {localDownloadCount}
                </span>
                <span className="flex items-center gap-1 hover:text-red-300 transition-colors">
                  <Heart className="h-3 w-3" />
                  {localLikeCount}
                </span>
              </div>
              {featuredProducer.most_popular_beat.duration && (
                <span className="flex items-center gap-1 hover:text-white transition-colors">
                  <Clock className="h-3 w-3" />
                  {formatTime(featuredProducer.most_popular_beat.duration)}
                </span>
              )}
            </div>
          )}

          {/* Top 5 Producers - Instagram Story Style at Bottom */}
          {producers.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                Top Producers
              </h4>
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                {producers.slice(0, 5).map((producer, index) => (
                  <Link key={producer.id} href={`/profile/${normalizeUsernameForUrl(producer.username)}`}>
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 sm:gap-2">
                      <div className="relative">
                        <button className={`relative p-0.5 rounded-full transition-all duration-200 ${
                          index === 0
                            ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500'
                            : 'bg-gradient-to-tr from-gray-500 to-gray-700 hover:from-yellow-400 hover:via-orange-500 hover:to-red-500'
                        }`}>
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-black/50">
                            <AvatarImage src={`/api/avatars/${producer.avatar_id}`} alt={producer.username} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-gray-600 to-gray-800">
                              {producer.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <Crown className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                            </div>
                          )}
                        </button>
                      </div>
                      <span className="text-xs text-gray-300 text-center max-w-[40px] sm:max-w-[50px] truncate">
                        {producer.username}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Play, 
  Pause, 
  Download, 
  Heart,
  Clock
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import StyledUsername from '@/components/ui/StyledUsername'
import { normalizeUsernameForUrl } from '@/lib/utils'

interface Beat {
  id: string
  title: string
  description: string
  is_free: boolean
  cost_flames?: number
  download_count: number
  like_count: number
  audio_url: string
  created_at: string
  uploader_id: string
  duration?: number
  producer: {
    id: string
    username: string
    avatar_id?: string
  }
}

interface BeatCardProps {
  beat: Beat
  onPlay: (beatId: string) => void
  isPlaying: boolean
  isCurrentBeat: boolean
}

export default function BeatCard({ beat, onPlay, isPlaying, isCurrentBeat }: BeatCardProps) {
  const { user } = useUser()
  const [isLiked, setIsLiked] = useState(false)
  const [localLikeCount, setLocalLikeCount] = useState(beat.like_count || 0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check like status on mount - FIXED: removed supabase dependency to prevent infinite loop
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) {
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('beat_likes')
          .select('*')
          .eq('beat_id', beat.id)
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          setIsLiked(false)
          return
        }

        setIsLiked(!!data) // Set to true if data exists, false otherwise
      } catch (error) {
        setIsLiked(false)
      }
    }

    checkLikeStatus()
  }, [user, beat.id]) // Removed supabase dependency to prevent infinite loop

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (onPlay) {
      if (isCurrentBeat && isPlaying) {
        onPlay('') // Stop current beat
      } else {
        onPlay(beat.id) // Play this beat
      }
    }
  }

  const handleDownload = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to auth page with signup mode
      window.location.href = '/auth?mode=signup'
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(beat.audio_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${beat.title} - ${beat.producer.username}.wav`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update download count in database
      const { error } = await supabase
        .from('beats')
        .update({ download_count: (beat.download_count || 0) + 1 })
        .eq('id', beat.id)

      if (error) {
        console.error('Error updating download count:', error)
      } else {
        // Update local state
        beat.download_count = (beat.download_count || 0) + 1
        // Force re-render
        setForceUpdate(prev => !prev)
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like beats')
      return
    }
    
    try {
      if (isLiked) {
        // Unlike: delete the like record
        const { error } = await supabase
          .from('beat_likes')
          .delete()
          .eq('beat_id', beat.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error unliking beat:', error)
          return
        }

        setIsLiked(false)
        setLocalLikeCount(prev => Math.max(0, prev - 1))
      } else {
        // Like: insert a new like record
        const { error } = await supabase
          .from('beat_likes')
          .insert({ beat_id: beat.id, user_id: user.id })

        if (error) {
          console.error('Error liking beat:', error)
          return
        }

        setIsLiked(true)
        setLocalLikeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error in handleLike:', error)
    }
  }

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/20 overflow-hidden hover:bg-black/30 transition-all duration-300 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/profile/${normalizeUsernameForUrl(beat.producer?.username || '')}`} className="flex items-center gap-2 mb-2 group">
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src={`/api/avatars/${beat.producer?.avatar_id}`} alt={beat.producer?.username || 'Unknown Artist'} />
                <AvatarFallback>{beat.producer?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <StyledUsername 
                username={beat.producer?.username || 'Unknown Artist'} 
                userId={beat.producer?.id || ''}
                className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors"
              />
            </Link>
            <CardTitle className="text-white text-lg mb-1">{beat.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {beat.is_free ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Free
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  {beat.cost_flames} Flaames
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Play, Like, Download Controls */}
        <div className="flex items-center justify-start gap-4">
          <Button
            onClick={handlePlayPause}
            className={`h-12 w-12 rounded-xl border-2 shadow-lg transition-all duration-200 ${
              isPlaying && isCurrentBeat
                ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            size="icon"
          >
            {isPlaying && isCurrentBeat ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <Button
            onClick={handleLike}
            className={`h-10 w-10 p-0 min-w-[40px] rounded-lg transition-all duration-200 flex items-center justify-center ${
              isLiked
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-transparent text-gray-400 border border-gray-500/20 hover:bg-white/10 hover:text-white'
            }`}
            size="icon"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-10 w-10 p-0 min-w-[40px] rounded-lg transition-all duration-200 flex items-center justify-center bg-transparent text-gray-400 border border-gray-500/20 hover:bg-white/10 hover:text-white"
            size="icon"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2">{beat.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {beat.download_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {localLikeCount}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {beat.duration ? formatTime(beat.duration) : '0:00'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}


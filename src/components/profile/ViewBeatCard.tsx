'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Download, 
  Heart, 
  Clock
} from 'lucide-react'

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
  duration?: number
}

interface ViewBeatCardProps {
  beat: Beat
}

export default function ViewBeatCard({ beat }: ViewBeatCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Initialize audio when component mounts
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const newAudio = new Audio(beat.audio_url)
      newAudio.preload = 'metadata'
      setAudio(newAudio)
    }
  }, [beat.audio_url])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (!audio) return
    
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      // Stop any other audio that might be playing
      const allAudios = document.querySelectorAll('audio')
      allAudios.forEach(a => {
        if (a !== audio) {
          a.pause()
          a.currentTime = 0
        }
      })
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
      })
      setIsPlaying(true)
    }
  }

  // Handle audio ended event
  useEffect(() => {
    if (audio) {
      const handleEnded = () => setIsPlaying(false)
      audio.addEventListener('ended', handleEnded)
      return () => audio.removeEventListener('ended', handleEnded)
    }
  }, [audio])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [audio])

  const handleDownload = async () => {
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
  }

  return (
    <Card className="group bg-black/20 backdrop-blur-xl border-white/20 overflow-hidden hover:bg-black/30 transition-all duration-500 shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
              {beat.title}
            </CardTitle>
            <p className="text-gray-300 text-sm line-clamp-2 group-hover:text-gray-200 transition-colors">
              {beat.description}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              {beat.is_free ? (
                <Badge className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/50 hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300">
                  Free
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-yellow-500/50 hover:from-yellow-500/40 hover:to-orange-500/40 transition-all duration-300">
                  {beat.cost_flames} Flaames
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Play Controls */}
        <div className="flex items-center justify-start gap-4">
          <Button
            onClick={handlePlayPause}
            className={`relative h-14 w-14 rounded-2xl border-2 shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${
              isPlaying
                ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-400 border-red-500/50 hover:from-red-500/40 hover:to-pink-500/40 shadow-red-500/30'
                : 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white border-purple-500/50 hover:from-purple-500/40 hover:to-blue-500/40 shadow-purple-500/30'
            }`}
            size="icon"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-1" />
            )}
            
            {/* Animated ring effect */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-current opacity-0 ${
              isPlaying ? 'animate-ping' : 'group-hover:animate-pulse'
            }`} />
          </Button>

          <Button
            onClick={handleDownload}
            className="h-12 w-12 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:from-emerald-500/30 hover:to-teal-500/30 shadow-emerald-500/20"
            size="icon"
          >
            <Download className="h-6 w-6" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 group-hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
              <Download className="h-3 w-3" />
              {beat.download_count || 0}
            </span>
            <span className="flex items-center gap-1 hover:text-red-300 transition-colors">
              <Heart className="h-3 w-3" />
              {beat.like_count || 0}
            </span>
          </div>
          <span className="flex items-center gap-1 hover:text-purple-300 transition-colors">
            <Clock className="h-3 w-3" />
            {beat.duration ? formatTime(beat.duration) : '0:00'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}


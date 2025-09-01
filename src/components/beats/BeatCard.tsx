'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Play, 
  Pause, 
  Download, 
  Heart,
  Volume2,
  Clock,
  Music
} from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'

interface Beat {
  id: string
  title: string
  artist: string
  description: string
  bpm: number
  key: string
  genre: string
  duration: number
  price: number
  is_free: boolean
  download_count: number
  rating: number
  tags: string[]

  audio_url: string
  waveform_url?: string
  created_at: string
  producer: {
    id: string
    username: string
    avatar_id?: string
    is_verified: boolean
  }
}

interface BeatCardProps {
  beat: Beat
  onPlay?: (beatId: string) => void
  isPlaying?: boolean
  isCurrentBeat?: boolean
}

export default function BeatCard({ beat, onPlay, isPlaying, isCurrentBeat }: BeatCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4B5563',
        progressColor: '#F97316',
        cursorColor: '#F97316',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 60,
        barGap: 2,
      })

      wavesurferRef.current.load(beat.audio_url)
      
      wavesurferRef.current.on('ready', () => {
        setIsLoaded(true)
        setDuration(wavesurferRef.current!.getDuration())
      })

      wavesurferRef.current.on('audioprocess', () => {
        setCurrentTime(wavesurferRef.current!.getCurrentTime())
      })

      wavesurferRef.current.on('finish', () => {
        setCurrentTime(0)
        if (onPlay) onPlay('')
      })
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
      }
    }
  }, [beat.audio_url, onPlay])

  useEffect(() => {
    if (wavesurferRef.current) {
      if (isPlaying && isCurrentBeat) {
        wavesurferRef.current.play()
      } else {
        wavesurferRef.current.pause()
      }
    }
  }, [isPlaying, isCurrentBeat])

  const handlePlayPause = () => {
    if (onPlay) {
      onPlay(isCurrentBeat ? '' : beat.id)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(beat.audio_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${beat.title} - ${beat.artist}.wav`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/20 overflow-hidden hover:bg-black/30 transition-all duration-300 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-1">{beat.title}</CardTitle>
            <p className="text-gray-400 text-sm mb-2">{beat.artist}</p>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-white/20">
                {beat.genre}
              </Badge>
              {beat.is_free && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Free
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-2 border border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`rounded-lg ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-white/20'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-lg text-gray-400 hover:text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Waveform */}
        <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div ref={waveformRef} className="w-full" />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
        </div>

        {/* Time and Controls */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className={`rounded-lg transition-all duration-200 ${
                isPlaying && isCurrentBeat 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {isPlaying && isCurrentBeat ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2">{beat.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {beat.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-300 bg-white/5 backdrop-blur-sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {beat.download_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {beat.rating}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(beat.duration)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

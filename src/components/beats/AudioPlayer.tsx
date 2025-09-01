'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  audioUrl: string
  isPlaying: boolean
  onPlayPause: () => void
  onTimeUpdate: (currentTime: number, duration: number) => void
  currentTime: number
  duration: number
}

export default function AudioPlayer({
  audioUrl,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  currentTime,
  duration
}: AudioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const waveformRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
      audioRef.current.crossOrigin = 'anonymous'
    }

    const audio = audioRef.current
    audio.src = audioUrl

    const handleLoadStart = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleTimeUpdate = () => {
      if (audio.duration) {
        onTimeUpdate(audio.currentTime, audio.duration)
      }
    }
    const handleEnded = () => onPlayPause()

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl, onTimeUpdate, onPlayPause])

  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audioRef.current.currentTime = newTime
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Waveform Visualization */}
      <div className="h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-2">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-1">
            {[...Array(50)].map((_, i) => {
              const height = Math.random() * 30 + 10
              const isActive = i < (progressPercentage / 2)
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isActive ? 'bg-orange-400' : 'bg-orange-400/30'
                  }`}
                  style={{ height: `${height}px` }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div 
        ref={waveformRef}
        className="relative h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
        onClick={handleTimelineClick}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
        <div 
          className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
          style={{ left: `${progressPercentage}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onPlayPause}
            disabled={isBuffering}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-white/10"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          
          {!isMuted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          )}
        </div>
      </div>
    </div>
  )
}


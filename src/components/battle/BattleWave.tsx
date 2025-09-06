'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import { useAudio } from '@/contexts/AudioContext'

interface BattleWaveProps {
  audioUrl: string
  entryId: string
  isOwner?: boolean
  username?: string
  avatarId?: string
}

export default function BattleWave({ audioUrl, entryId, isOwner, username, avatarId }: BattleWaveProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const { playAudio, currentTrack, isPlaying: globalIsPlaying } = useAudio()

  useEffect(() => {
    if (!waveformRef.current) return

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4f46e5',
      progressColor: '#f59e0b',
      cursorColor: '#f59e0b',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 60,
      barGap: 3,
    })

    wavesurferRef.current = wavesurfer

    // Load audio
    wavesurfer.load(audioUrl)

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('finish', () => {
      setIsPlaying(false)
    })

    return () => {
      wavesurfer.destroy()
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!wavesurferRef.current) return

    // Check if this is the currently playing track in the global player
    const isCurrentTrack = currentTrack?.audioUrl === audioUrl

    if (isCurrentTrack && globalIsPlaying) {
      // If this is the current track and it's playing globally, pause it
      wavesurferRef.current.pause()
      setIsPlaying(false)
    } else if (isCurrentTrack && !globalIsPlaying) {
      // If this is the current track but not playing globally, resume it
      wavesurferRef.current.play()
      setIsPlaying(true)
    } else {
      // If this is not the current track, play it in the global player
      const trackName = username ? `${username}'s Entry` : 'Battle Entry'
      playAudio(audioUrl, trackName, username, avatarId)
      
      // Also play locally for waveform visualization
      wavesurferRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!wavesurferRef.current) return

    wavesurferRef.current.setMuted(!isMuted)
    setIsMuted(!isMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      {/* Waveform */}
      <div 
        ref={waveformRef}
        className="w-full bg-black/20 rounded-lg p-3"
      />
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlay}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            onClick={toggleMute}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Time Display */}
        <div className="text-sm text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}

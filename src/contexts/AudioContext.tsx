'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface AudioTrack {
  id: string
  title: string
  artist: string
  audioUrl: string
  duration: number
  username?: string
  avatarId?: string
}

interface AudioContextType {
  currentTrack: AudioTrack | null
  currentTrackUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playTrack: (track: AudioTrack) => void
  playAudio: (trackUrl: string, trackName: string, username?: string, avatarId?: string) => void
  pauseTrack: () => void
  pauseAudio: () => void
  resumeTrack: () => void
  stopTrack: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  updateCurrentTime: (time: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
      audioRef.current.crossOrigin = 'anonymous'
      audioRef.current.volume = 0.8 // Set default volume
    }

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const playTrack = (track: AudioTrack) => {
    if (!audioRef.current) return

    console.log('Playing track:', track.title, 'URL:', track.audioUrl)

    // Stop current track if different
    if (currentTrack?.id !== track.id) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    audioRef.current.src = track.audioUrl
    setCurrentTrack(track)
    setCurrentTrackUrl(track.audioUrl)
    
    setIsPlaying(true)
    audioRef.current.play().catch((error) => {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
    })
  }

  const playAudio = (trackUrl: string, trackName: string, username?: string, avatarId?: string) => {
    if (!audioRef.current) return

    // Stop current track if different
    if (currentTrackUrl !== trackUrl) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    audioRef.current.src = trackUrl
    setCurrentTrackUrl(trackUrl)
    
    // Create a track object for the floating player
    const trackObject: AudioTrack = {
      id: `battle-${Date.now()}`, // Generate unique ID for battle tracks
      title: trackName,
      artist: username || 'Battle Track',
      audioUrl: trackUrl,
      duration: 0, // Will be set when metadata loads
      username: username,
      avatarId: avatarId
    }
    setCurrentTrack(trackObject)
    
    // Set playing state and play audio
    setIsPlaying(true)
    audioRef.current.play().catch(console.error)
  }

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resumeTrack = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
      setCurrentTrack(null) // This will hide the player
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume
    }
  }

  const updateCurrentTime = (time: number) => {
    setCurrentTime(time)
  }

  const value: AudioContextType = {
    currentTrack,
    currentTrackUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    playAudio,
    pauseTrack,
    pauseAudio,
    resumeTrack,
    stopTrack,
    seekTo,
    setVolume,
    toggleMute,
    updateCurrentTime
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

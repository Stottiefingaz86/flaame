'use client'

import { useAudio } from '@/contexts/AudioContext'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  X
} from 'lucide-react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StyledUsername from '@/components/ui/StyledUsername'

export default function PersistentPlayer() {
  const { user } = useUser()
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seekTo,
    setVolume,
    toggleMute
  } = useAudio()

  if (!currentTrack) return null

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    seekTo(newTime)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-t border-white/20 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between gap-2">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0 max-w-[200px] md:max-w-none">
              <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/20 flex-shrink-0">
                <AvatarImage src={currentTrack?.avatarId ? `/api/avatars/${currentTrack.avatarId}` : undefined} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm md:text-lg">
                  {currentTrack?.username?.charAt(0).toUpperCase() || currentTrack?.artist?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate text-sm md:text-base">{currentTrack.title}</h4>
                <p className="text-gray-400 text-xs md:text-sm truncate">
                  {currentTrack.username ? (
                    <StyledUsername 
                      username={currentTrack.username} 
                      userId={''}
                      className="text-gray-400"
                    />
                  ) : (
                    currentTrack.artist
                  )}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 md:gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1 md:p-2 border border-white/10">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => seekTo(Math.max(0, currentTime - 10))}
                className="text-white hover:bg-white/20 rounded-lg p-1 md:p-2"
              >
                <SkipBack className="w-3 h-3 md:w-4 md:h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="text-white hover:bg-white/20 rounded-lg p-1 md:p-2"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                className="text-white hover:bg-white/20 rounded-lg p-1 md:p-2"
              >
                <SkipForward className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>

            {/* Progress Bar - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex flex-1 mx-4">
              <div className="flex items-center gap-2 mb-1 w-full">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <div className="flex-1 relative">
                  <div
                    className="h-2 bg-white/10 backdrop-blur-sm rounded-full cursor-pointer overflow-hidden border border-white/20"
                    onClick={handleTimelineClick}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume Controls */}
            <div className="flex items-center gap-1 md:gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1 md:p-2 border border-white/10 relative">
              {/* Mobile: Just mute toggle and close */}
              <div className="md:hidden flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 rounded-lg p-1"
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopTrack}
                  className="text-white hover:bg-white/20 rounded-lg p-1"
                  title="Stop and hide player"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Desktop: Full volume controls */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopTrack}
                  className="text-white hover:bg-white/20 rounded-lg"
                  title="Stop and hide player"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

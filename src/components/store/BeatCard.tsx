'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Beat } from '@/lib/db'
import { Flame, Play, Pause, Volume2, Check } from 'lucide-react'

interface BeatCardProps {
  beat: Beat
  userBalance: number
  isOwned: boolean
}

export default function BeatCard({ beat, userBalance, isOwned }: BeatCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const handlePurchase = async () => {
    setIsPurchasing(true)
    setError(null)

    try {
      const response = await fetch('/api/beats/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beatId: beat.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to purchase beat')
      }

      // Refresh the page to update balance and ownership status
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase beat')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handlePlayPause = () => {
    if (!audio) {
      const newAudio = new Audio(beat.audio_url)
      newAudio.addEventListener('ended', () => setIsPlaying(false))
      setAudio(newAudio)
      newAudio.play()
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
      }
    }
  }

  const canAfford = userBalance >= beat.cost_flames

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 overflow-hidden">
        <CardHeader className="p-4">
          <div className="relative">
            <div className="w-full h-48 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🎵</div>
                <p className="text-white font-medium">{beat.artist}</p>
              </div>
            </div>
            {isOwned && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
            )}
            {beat.cost_flames === 0 && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                FREE
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <CardTitle className="text-white text-lg">{beat.title}</CardTitle>
          <p className="text-gray-400 text-sm">by {beat.artist}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="font-semibold">
                {beat.cost_flames === 0 ? 'Free' : `${beat.cost_flames} 🔥`}
              </span>
            </div>
          </div>

          {/* Audio Preview */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayPause}
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
            <span className="text-gray-400 text-sm">Preview</span>
          </div>

          {error && (
            <div className="p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handlePurchase}
            disabled={isOwned || !canAfford || isPurchasing}
            variant={isOwned ? "outline" : canAfford ? "flame" : "outline"}
            className="w-full"
          >
            {isPurchasing ? (
              'Purchasing...'
            ) : isOwned ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Owned
              </>
            ) : canAfford ? (
              <>
                <Flame className="w-4 h-4 mr-2" />
                Buy for {beat.cost_flames} 🔥
              </>
            ) : (
              'Insufficient Flames'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

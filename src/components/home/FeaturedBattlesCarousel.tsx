'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Flame, 
  Users, 
  Clock, 
  ArrowRight,
  Play,
  Pause,
  Trophy,
  Crown
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAudio } from '@/contexts/AudioContext'
import Link from 'next/link'

interface Battle {
  id: string
  title: string
  description?: string
  status: string
  created_at: string
  challenger_id: string
  opponent_id?: string
  challenger_username: string
  opponent_username?: string
  challenger_avatar_id?: string
  opponent_avatar_id?: string
  total_votes: number
  challenger_votes: number
  opponent_votes: number
  beat_title?: string
  beat_audio_url?: string
}

export default function FeaturedBattlesCarousel() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { playAudio, pauseAudio, currentTrackUrl, isPlaying } = useAudio()

  useEffect(() => {
    loadFeaturedBattles()
  }, [])

  const handlePlayTrack = async (audioUrl: string, trackName: string, username?: string) => {
    try {
      // Check if this track is currently playing
      if (currentTrackUrl === audioUrl && isPlaying) {
        pauseAudio()
      } else {
        // Play the track
        playAudio(audioUrl, trackName, username, battle?.user?.avatar_id)
      }
    } catch (error) {
      console.error('Error playing track:', error)
    }
  }

  const loadFeaturedBattles = async () => {
    try {
      setIsLoading(true)
      
      // First try to get active battles with both participants
      let { data, error } = await supabase
        .from('battles')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          challenger_id,
          opponent_id,
          total_votes,
          challenger_votes,
          opponent_votes,
          challenger:profiles!battles_challenger_id_fkey(
            username,
            avatar_id
          ),
          opponent:profiles!battles_opponent_id_fkey(
            username,
            avatar_id
          ),
          beat:beats(
            title,
            audio_url
          )
        `)
        .eq('status', 'active')
        .not('opponent_id', 'is', null)
        .order('total_votes', { ascending: false })
        .limit(5)

      // If no active battles with opponents, get open battles instead
      if (!data || data.length === 0) {
        const { data: openBattles, error: openError } = await supabase
          .from('battles')
          .select(`
            id,
            title,
            description,
            status,
            created_at,
            challenger_id,
            opponent_id,
            total_votes,
            challenger_votes,
            opponent_votes,
            challenger:profiles!battles_challenger_id_fkey(
              username,
              avatar_id
            ),
            opponent:profiles!battles_opponent_id_fkey(
              username,
              avatar_id
            ),
            beat:beats(
              title,
              audio_url
            )
          `)
          .eq('status', 'pending')
          .not('opponent_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (openError) {
          console.error('Error loading open battles:', openError)
          return
        }
        
        data = openBattles
        error = openError
      }

      if (error) {
        console.error('Error loading battles:', error)
        return
      }

      if (data) {
        const formattedBattles = data.map(battle => ({
          id: battle.id,
          title: battle.title,
          description: battle.description,
          status: battle.status,
          created_at: battle.created_at,
          challenger_id: battle.challenger_id,
          opponent_id: battle.opponent_id,
          challenger_username: battle.challenger?.username || 'Unknown',
          opponent_username: battle.opponent?.username,
          challenger_avatar_id: battle.challenger?.avatar_id,
          opponent_avatar_id: battle.opponent?.avatar_id,
          total_votes: battle.total_votes || 0,
          challenger_votes: battle.challenger_votes || 0,
          opponent_votes: battle.opponent_votes || 0,
          beat_title: battle.beat?.title,
          beat_audio_url: battle.beat?.audio_url
        }))
        
        setBattles(formattedBattles)
      }
    } catch (error) {
      console.error('Error loading featured battles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextBattle = () => {
    setCurrentIndex((prev) => (prev + 1) % battles.length)
  }

  const prevBattle = () => {
    setCurrentIndex((prev) => (prev - 1 + battles.length) % battles.length)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center py-8 text-gray-400">
          Loading featured battles...
        </div>
      </div>
    )
  }

  if (battles.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-orange-400" />
          <h3 className="text-2xl font-bold text-white mb-2">Ready for Battle?</h3>
          <p className="text-gray-300 mb-6">No active battles right now. Be the first to start the next epic showdown!</p>
          <Link href="/arena" className="inline-block">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3">
              <Trophy className="w-5 h-5 mr-2" />
              Create Battle
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentBattle = battles[currentIndex]

  return (
    <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-orange-400" />
            Featured Battles
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={prevBattle}
              className="border-white/20 text-white hover:bg-white/10"
            >
              ←
            </Button>
            <span className="text-sm text-gray-400 px-2">
              {currentIndex + 1} / {battles.length}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={nextBattle}
              className="border-white/20 text-white hover:bg-white/10"
            >
              →
            </Button>
            <Link href="/arena">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 ml-2">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Battle Content */}
        <motion.div
          key={currentBattle.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 flex-1 flex flex-col"
        >
          {/* Battle Title */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{currentBattle.title}</h3>
            {currentBattle.description && (
              <p className="text-gray-300">{currentBattle.description}</p>
            )}
          </div>

          {/* Beat Player */}
          {currentBattle.beat_audio_url && (
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Play className="w-4 h-4 text-orange-400" />
                  Beat: {currentBattle.beat_title}
                </h4>
                <Button 
                  size="sm"
                  onClick={() => handlePlayTrack(
                    currentBattle.beat_audio_url!,
                    currentBattle.beat_title || 'Battle Beat',
                    'Producer'
                  )}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  {currentTrackUrl === currentBattle.beat_audio_url && isPlaying ? (
                    <Pause className="w-4 h-4 mr-1" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  {currentTrackUrl === currentBattle.beat_audio_url && isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>
            </div>
          )}

          {/* Battlers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Challenger */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Avatar className="h-16 w-16 border-2 border-orange-500/30">
                  <AvatarImage src={currentBattle.challenger_avatar_id ? `/api/avatars/${encodeURIComponent(currentBattle.challenger_avatar_id)}` : undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl">
                    {currentBattle.challenger_username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-lg font-semibold text-white">{currentBattle.challenger_username}</h4>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Challenger
                  </Badge>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {currentBattle.challenger_votes} votes
              </div>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center md:col-span-2">
              <div className="text-3xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-16 h-16 flex items-center justify-center">
                VS
              </div>
            </div>

            {/* Opponent */}
            {currentBattle.opponent_username && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Avatar className="h-16 w-16 border-2 border-blue-500/30">
                    <AvatarImage src={currentBattle.opponent_avatar_id ? `/api/avatars/${encodeURIComponent(currentBattle.opponent_avatar_id)}` : undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                      {currentBattle.opponent_username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{currentBattle.opponent_username}</h4>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <Users className="w-3 h-3 mr-1" />
                      Opponent
                    </Badge>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {currentBattle.opponent_votes} votes
                </div>
              </div>
            )}
          </div>

          {/* Battle Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {currentBattle.total_votes} total votes
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(currentBattle.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-auto">
            <Link href={`/battle/${currentBattle.id}`}>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                <Trophy className="w-4 h-4 mr-2" />
                View Battle
              </Button>
            </Link>
            <Link href="/arena">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Join Battles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Flame, Heart, Download, Music } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LeadingProducer {
  id: string
  username: string
  avatar_id?: string
  total_likes: number
  total_downloads: number
  total_gifts: number
  total_flaames: number
  beat_count: number
  rank: number
}

export default function LeadingProducer() {
  const [leadingProducers, setLeadingProducers] = useState<LeadingProducer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeadingProducers()
  }, [])

  const loadLeadingProducers = async () => {
    try {
      setIsLoading(true)
      
      // Get producers ranked by total engagement (likes + downloads + gifts)
      const { data, error } = await supabase
        .from('beats')
        .select(`
          uploader_id,
          like_count,
          download_count,
          gift_count,
          profiles!beats_uploader_id_fkey (
            id,
            username,
            avatar_id
          )
        `)
        .not('uploader_id', 'is', null)

      if (error) {
        console.error('Error loading leading producers:', error)
        return
      }

      // Aggregate data by producer
      const producerStats = new Map<string, LeadingProducer>()
      
      data?.forEach(beat => {
        const producerId = beat.uploader_id
        const producer = beat.profiles
        
        if (!producer || !producerId) return
        
        if (!producerStats.has(producerId)) {
          producerStats.set(producerId, {
            id: producerId,
            username: producer.username,
            avatar_id: producer.avatar_id,
            total_likes: 0,
            total_downloads: 0,
            total_gifts: 0,
            total_flaames: 0,
            beat_count: 0,
            rank: 0
          })
        }
        
        const stats = producerStats.get(producerId)!
        stats.total_likes += beat.like_count || 0
        stats.total_downloads += beat.download_count || 0
        stats.total_gifts += beat.gift_count || 0
        stats.total_flaames += (beat.gift_count || 0) * 10 // Each gift is 10 flaames
        stats.beat_count += 1
      })

      // Convert to array and sort by total engagement
      const sortedProducers = Array.from(producerStats.values())
        .sort((a, b) => {
          const aScore = a.total_likes + a.total_downloads + a.total_gifts
          const bScore = b.total_likes + b.total_downloads + b.total_gifts
          return bScore - aScore
        })
        .slice(0, 5) // Top 5 producers
        .map((producer, index) => ({
          ...producer,
          rank: index + 1
        }))

      setLeadingProducers(sortedProducers)
    } catch (error) {
      console.error('Error loading leading producers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400' // Gold
      case 2: return 'text-gray-300'   // Silver
      case 3: return 'text-amber-600'  // Bronze
      default: return 'text-gray-400'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${rank}`
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leading Producers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading top producers...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leading Producers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leadingProducers.length === 0 ? (
          <div className="text-center py-8">
            <Music className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No producers yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leadingProducers.map((producer) => (
              <div key={producer.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-orange-500/30">
                      <AvatarImage src={producer.avatar_id ? `/api/avatars/${producer.avatar_id}` : undefined} />
                      <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                        {producer.username?.charAt(0).toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white ${getRankColor(producer.rank)}`}>
                      {getRankIcon(producer.rank)}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold">{producer.username}</h3>
                    <p className="text-gray-400 text-sm">{producer.beat_count} beats</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-red-400">
                      <Heart className="w-4 h-4" />
                      <span>{producer.total_likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Download className="w-4 h-4" />
                      <span>{producer.total_downloads}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-4 h-4" />
                      <span>{producer.total_flaames}</span>
                    </div>
                  </div>
                  <Badge className={`mt-2 ${getRankColor(producer.rank)} border-current`}>
                    #{producer.rank} Producer
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



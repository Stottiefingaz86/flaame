'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Crown, 
  Music, 
  Heart, 
  Download, 
  TrendingUp,
  ArrowRight,
  Play
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface FeaturedProducer {
  id: string
  username: string
  avatar_id?: string
  total_likes: number
  total_downloads: number
  total_beats: number
  most_popular_beat?: {
    id: string
    title: string
    audio_url: string
    like_count: number
    download_count: number
  }
}

export default function FeaturedProducer() {
  const [featuredProducer, setFeaturedProducer] = useState<FeaturedProducer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducer()
  }, [])

  const loadFeaturedProducer = async () => {
    try {
      setIsLoading(true)
      
      // Get the producer with the highest combined score (likes + downloads)
      const { data: beats, error } = await supabase
        .from('beats')
        .select(`
          id,
          title,
          audio_url,
          like_count,
          download_count,
          uploader_id,
          profiles!beats_uploader_id_fkey(
            id,
            username,
            avatar_id
          )
        `)
        .not('uploader_id', 'is', null)

      if (error) {
        console.error('Error loading beats:', error)
        return
      }

      if (beats && beats.length > 0) {
        // Group beats by producer and calculate totals
        const producerStats = beats.reduce((acc: any, beat) => {
          const producerId = beat.uploader_id
          if (!acc[producerId]) {
            acc[producerId] = {
              id: producerId,
              username: beat.profiles?.username || 'Unknown',
              avatar_id: beat.profiles?.avatar_id,
              total_likes: 0,
              total_downloads: 0,
              total_beats: 0,
              most_popular_beat: null
            }
          }
          
          acc[producerId].total_likes += beat.like_count || 0
          acc[producerId].total_downloads += beat.download_count || 0
          acc[producerId].total_beats += 1
          
          // Keep track of the most popular beat (highest likes + downloads)
          if (!acc[producerId].most_popular_beat || 
              (beat.like_count + beat.download_count) > 
              (acc[producerId].most_popular_beat.like_count + acc[producerId].most_popular_beat.download_count)) {
            acc[producerId].most_popular_beat = {
              id: beat.id,
              title: beat.title,
              audio_url: beat.audio_url,
              like_count: beat.like_count || 0,
              download_count: beat.download_count || 0
            }
          }
          
          return acc
        }, {})

        // Find the producer with the highest score
        const topProducer = Object.values(producerStats).reduce((top: any, current: any) => {
          const topScore = top.total_likes + top.total_downloads
          const currentScore = current.total_likes + current.total_downloads
          return currentScore > topScore ? current : top
        })

        setFeaturedProducer(topProducer)
      }
    } catch (error) {
      console.error('Error loading featured producer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20">
        <CardContent className="p-8">
          <div className="text-center py-8 text-gray-400">
            Loading featured producer...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!featuredProducer) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mb-16"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Crown className="w-8 h-8 text-purple-400" />
          Leading Producer
        </h2>
        <Link href="/beats">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            View All Beats
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
      
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20 border-4 border-purple-500/30">
                  <AvatarImage src={featuredProducer.avatar_id ? `/api/avatars/${featuredProducer.avatar_id}` : undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">
                    {featuredProducer.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{featuredProducer.username}</h3>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Crown className="w-4 h-4 mr-1" />
                    Top Producer
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{featuredProducer.total_beats}</div>
                  <div className="text-gray-400 text-sm">Beats</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{featuredProducer.total_likes}</div>
                  <div className="text-gray-400 text-sm">Likes</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <Download className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{featuredProducer.total_downloads}</div>
                  <div className="text-gray-400 text-sm">Downloads</div>
                </div>
              </div>
              
              <Link href={`/profile/${featuredProducer.username.toLowerCase()}`}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </div>
            
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                Most Popular Beat
              </h4>
              
              {featuredProducer.most_popular_beat ? (
                <div>
                  <h5 className="text-white font-medium mb-3">{featuredProducer.most_popular_beat.title}</h5>
                  
                  {/* Waveform Placeholder */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 mb-4 border border-purple-500/30">
                    <div className="flex items-center justify-center h-16">
                      <div className="flex items-end gap-1 h-full">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-400 rounded-full"
                            style={{
                              height: `${Math.random() * 60 + 20}%`,
                              opacity: 0.7
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {featuredProducer.most_popular_beat.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {featuredProducer.most_popular_beat.download_count}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    <Link href="/beats">
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Music className="w-12 h-12 mx-auto mb-3" />
                  <p>No beats available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Flame,
  Clock,
  Calendar,
  Users,
  Crown,
  Music,
  FileText,
  Vote,
  Sword,
  TrendingUp,
  Award,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface User {
  id: string
  email?: string
  username?: string
  flames?: number
  user_metadata?: Record<string, unknown>
}

interface Battle {
  id: string
  title: string
  description: string
  beat_id: string
  challenger_id: string
  opponent_id: string
  stakes: number
  status: 'active' | 'pending' | 'finished'
  created_at: string
  ends_at: string
  challenger: {
    id: string
    username: string
    avatar_id?: string
    rank: string
    is_verified: boolean
  }
  opponent: {
    id: string
    username: string
    avatar_id?: string
    rank: string
    is_verified: boolean
  }
  beat: {
    id: string
    title: string
    artist: string
    bpm: number
    key: string
    genre: string
  }
  challenger_votes: number
  opponent_votes: number
  challenger_lyrics?: string
  opponent_lyrics?: string
  user_voted_for?: string
}

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})

  useEffect(() => {
    loadBattles()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      loadUserVotes(user.id)
    }
  }

  const loadBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select(`
          *,
          challenger:profiles!battles_challenger_id_fkey(
            id, username, avatar_id, rank, is_verified
          ),
          opponent:profiles!battles_opponent_id_fkey(
            id, username, avatar_id, rank, is_verified
          ),
          beat:beats(
            id, title, artist, bpm, key, genre
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBattles(data || [])
    } catch (error) {
      console.error('Error loading battles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserVotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('battle_id, voted_for')
        .eq('user_id', userId)

      if (error) throw error
      
      const votesMap: Record<string, string> = {}
      data?.forEach(vote => {
        votesMap[vote.battle_id] = vote.voted_for
      })
      setUserVotes(votesMap)
    } catch (error) {
      console.error('Error loading user votes:', error)
    }
  }

  const handleVote = async (battleId: string, participantId: string) => {
    if (!user) {
      window.location.href = '/auth'
      return
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        // Update existing vote
        await supabase
          .from('votes')
          .update({ voted_for: participantId, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id)
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            battle_id: battleId,
            user_id: user.id,
            voted_for: participantId
          })
      }

      // Update local state
      setUserVotes(prev => ({ ...prev, [battleId]: participantId }))
      
      // Reload battles to update vote counts
      loadBattles()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const formatTimeLeft = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'legendary': return 'text-yellow-400'
      case 'epic': return 'text-purple-400'
      case 'rare': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'finished': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getBattleGradient = (index: number) => {
    const gradients = [
      'from-orange-500/20 to-red-500/20',
      'from-blue-500/20 to-purple-500/20',
      'from-green-500/20 to-teal-500/20',
      'from-pink-500/20 to-rose-500/20',
      'from-indigo-500/20 to-blue-500/20',
      'from-emerald-500/20 to-green-500/20'
    ]
    return gradients[index % gradients.length]
  }

  const filteredBattles = battles.filter(battle => {
    if (activeTab === 'active') return battle.status === 'active'
    if (activeTab === 'pending') return battle.status === 'pending'
    if (activeTab === 'finished') return battle.status === 'finished'
    return true
  })

  const canSeeVotes = (battleId: string) => {
    return user && userVotes[battleId]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading battles...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-3xl mb-2">Battle Arena</h1>
              <p className="text-gray-400">Watch the hottest rap battles and cast your votes</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Battles run for 6 days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-black/30">
            <TabsTrigger value="active" className="text-white">
              <Sword className="w-4 h-4 mr-2" />
              Active Battles
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-white">
              <Clock className="w-4 h-4 mr-2" />
              Open Challenges
            </TabsTrigger>
            <TabsTrigger value="finished" className="text-white">
              <Award className="w-4 h-4 mr-2" />
              Finished
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Battles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBattles.map((battle, index) => {
            const totalVotes = battle.challenger_votes + battle.opponent_votes
            const challengerPercentage = totalVotes > 0 ? (battle.challenger_votes / totalVotes) * 100 : 50
            const opponentPercentage = totalVotes > 0 ? (battle.opponent_votes / totalVotes) * 100 : 50
            const userVotedFor = userVotes[battle.id]
            const showVotes = canSeeVotes(battle.id)

            return (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/battles/${battle.id}`}>
                  <Card className={`bg-gradient-to-br ${getBattleGradient(index)} border-white/20 backdrop-blur-md hover:border-white/30 transition-all duration-300 cursor-pointer group`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={battle.challenger.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                {battle.challenger.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white font-semibold">VS</span>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={battle.opponent.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                {battle.opponent.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {battle.challenger.username} vs {battle.opponent.username}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Badge variant="outline" className="border-white/30 text-white">
                                {battle.beat.bpm} BPM
                              </Badge>
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeLeft(battle.ends_at)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(battle.status)}>
                          {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Battle Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-semibold text-lg">{battle.title}</h3>
                        <p className="text-gray-300 text-sm">{battle.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created {new Date(battle.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            <span>{battle.beat.title}</span>
                          </div>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Challenger */}
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={battle.challenger.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                {battle.challenger.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-sm font-medium">{battle.challenger.username}</span>
                            {battle.challenger.is_verified && (
                              <Badge className="h-2 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">✓</Badge>
                            )}
                          </div>
                          <div className={`text-xs ${getRankColor(battle.challenger.rank)}`}>
                            {battle.challenger.rank}
                          </div>
                          
                        </div>

                        {/* Opponent */}
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={battle.opponent.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                {battle.opponent.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-sm font-medium">{battle.opponent.username}</span>
                            {battle.opponent.is_verified && (
                              <Badge className="h-2 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">✓</Badge>
                            )}
                          </div>
                          <div className={`text-xs ${getRankColor(battle.opponent.rank)}`}>
                            {battle.opponent.rank}
                          </div>
                          
                        </div>
                      </div>

                      

                                             {/* Voting Section */}
                       {battle.status === 'active' && (
                         <div className="space-y-3 pt-2">
                           <div className="text-center">
                             <p className="text-gray-400 text-sm mb-2">Cast your vote with flames</p>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3">
                             {/* Challenger Vote */}
                             <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-white text-sm font-medium">{battle.challenger.username}</span>
                                 {userVotedFor === battle.challenger_id && (
                                   <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                     Voted
                                   </Badge>
                                 )}
                               </div>
                               {user ? (
                                 <div className="flex gap-2">
                                   <Button
                                     size="sm"
                                     onClick={(e) => {
                                       e.preventDefault()
                                       handleVote(battle.id, battle.challenger_id)
                                     }}
                                     className={`flex-1 text-xs ${
                                       userVotedFor === battle.challenger_id
                                         ? 'bg-orange-500 text-white'
                                         : 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30'
                                     }`}
                                   >
                                     <Flame className="w-3 h-3 mr-1" />
                                     {userVotedFor === battle.challenger_id ? 'Voted' : 'Vote'}
                                   </Button>
                                 </div>
                               ) : (
                                 <div className="text-center py-2">
                                   <span className="text-gray-500 text-xs">Sign in to vote</span>
                                 </div>
                               )}
                             </div>

                             {/* Opponent Vote */}
                             <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-white text-sm font-medium">{battle.opponent.username}</span>
                                 {userVotedFor === battle.opponent_id && (
                                   <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                     Voted
                                   </Badge>
                                 )}
                               </div>
                               {user ? (
                                 <div className="flex gap-2">
                                   <Button
                                     size="sm"
                                     onClick={(e) => {
                                       e.preventDefault()
                                       handleVote(battle.id, battle.opponent_id)
                                     }}
                                     className={`flex-1 text-xs ${
                                       userVotedFor === battle.opponent_id
                                         ? 'bg-blue-500 text-white'
                                         : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                                     }`}
                                   >
                                     <Flame className="w-3 h-3 mr-1" />
                                     {userVotedFor === battle.opponent_id ? 'Voted' : 'Vote'}
                                   </Button>
                                 </div>
                               ) : (
                                 <div className="text-center py-2">
                                   <span className="text-gray-500 text-xs">Sign in to vote</span>
                                 </div>
                               )}
                             </div>
                           </div>

                           {!user && (
                             <div className="text-center pt-2">
                               <Link href="/auth">
                                 <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs">
                                   Sign In to Vote
                                 </Button>
                               </Link>
                             </div>
                           )}
                         </div>
                       )}

                       {/* Pending Battle Actions */}
                       {battle.status === 'pending' && user && battle.opponent_id === user.id && (
                         <div className="flex gap-2 pt-2">
                           <Button size="sm" className="flex-1 bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 text-xs">
                             Accept Challenge
                           </Button>
                           <Button size="sm" variant="outline" className="flex-1 border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs">
                             Decline
                           </Button>
                         </div>
                       )}

                      {/* Features Indicator */}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {(battle.challenger_lyrics || battle.opponent_lyrics) && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Lyrics</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          <span>Beat</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>Sponsorships</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {filteredBattles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sword className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-400 mb-2">No battles found</h3>
              <p className="text-gray-500 text-sm">There are no {activeTab} battles at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

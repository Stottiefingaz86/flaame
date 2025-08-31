'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Flame,
  Play,
  Pause,
  Clock,
  Calendar,
  Users,
  Crown,
  Music,
  FileText,
  Vote
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
}

export default function BattlePage() {
  const params = useParams()
  const battleId = params.id as string
  
  const [battle, setBattle] = useState<Battle | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<'challenger' | 'opponent' | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})

  useEffect(() => {
    loadBattle()
    checkAuth()
  }, [battleId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      loadUserVotes(user.id)
    }
  }

  const loadBattle = async () => {
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
        .eq('id', battleId)
        .single()

      if (error) throw error
      setBattle(data)
    } catch (error) {
      console.error('Error loading battle:', error)
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

  const handleVote = async (participantId: string) => {
    if (!user || !battle) {
      if (!user) window.location.href = '/auth'
      return
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('battle_id', battle.id)
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
            battle_id: battle.id,
            user_id: user.id,
            voted_for: participantId
          })
      }

      // Update local state
      setUserVotes(prev => ({ ...prev, [battle.id]: participantId }))
      
      // Reload battle to update vote counts
      loadBattle()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading battle...</div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Battle not found</div>
      </div>
    )
  }

  const totalVotes = battle.challenger_votes + battle.opponent_votes
  const challengerPercentage = totalVotes > 0 ? (battle.challenger_votes / totalVotes) * 100 : 50
  const opponentPercentage = totalVotes > 0 ? (battle.opponent_votes / totalVotes) * 100 : 50

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/battles">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-white font-bold text-xl">{battle.title}</h1>
              <p className="text-gray-400 text-sm">{battle.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Battle Card */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={battle.challenger.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          {battle.challenger.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-semibold">VS</span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={battle.opponent.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {battle.opponent.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">
                        {battle.challenger.username} vs {battle.opponent.username}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Badge variant="outline" className="border-white/20 text-white">
                          {battle.beat.bpm} BPM
                        </Badge>
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeLeft(battle.ends_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Battle Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(battle.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Ends {new Date(battle.ends_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Beat Info */}
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium">Beat: {battle.beat.title}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    by {battle.beat.artist} • {battle.beat.genre} • {battle.beat.key}
                  </div>
                </div>

                {/* Voting Section */}
                <div className="space-y-4">
                                     <div className="flex items-center justify-between">
                     <h3 className="text-white font-semibold">Vote Results</h3>
                     {user && userVotes[battle.id] && (
                       <div className="flex items-center gap-2 text-sm text-gray-400">
                         <Flame className="w-4 h-4 text-orange-400" />
                         <span>Stakes: {battle.stakes} flames</span>
                       </div>
                     )}
                   </div>

                  <div className="space-y-3">
                    {/* Challenger Votes */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={battle.challenger.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                          {battle.challenger.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                                                 <div className="flex items-center justify-between mb-1">
                           <span className="text-white text-sm font-medium">{battle.challenger.username}</span>
                           {user && userVotes[battle.id] && (
                             <span className="text-orange-400 text-sm font-medium">
                               {battle.challenger_votes.toLocaleString()} flames
                             </span>
                           )}
                         </div>
                                                 {user && userVotes[battle.id] && (
                           <Progress value={challengerPercentage} className="h-2 bg-white/10" />
                         )}
                      </div>
                    </div>

                    {/* Opponent Votes */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={battle.opponent.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          {battle.opponent.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                                                 <div className="flex items-center justify-between mb-1">
                           <span className="text-white text-sm font-medium">{battle.opponent.username}</span>
                           {user && userVotes[battle.id] && (
                             <span className="text-blue-400 text-sm font-medium">
                               {battle.opponent_votes.toLocaleString()} flames
                             </span>
                           )}
                         </div>
                                                 {user && userVotes[battle.id] && (
                           <Progress value={opponentPercentage} className="h-2 bg-white/10" />
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  {battle.status === 'active' && (
                    <div className="space-y-4 pt-4">
                      <div className="text-center">
                        <h4 className="text-white font-semibold mb-2">Cast your vote with flames</h4>
                        <p className="text-gray-400 text-sm">Each vote costs 1 flame. You can change your vote anytime.</p>
                      </div>
                      
                      {user ? (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Challenger Vote */}
                          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-medium">{battle.challenger.username}</span>
                              {userVotes[battle.id] === battle.challenger_id && (
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                  Your Vote
                                </Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleVote(battle.challenger_id)}
                              className={`w-full ${
                                userVotes[battle.id] === battle.challenger_id
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30'
                              }`}
                            >
                              <Flame className="w-4 h-4 mr-2" />
                              {userVotes[battle.id] === battle.challenger_id ? 'Voted' : 'Vote'}
                            </Button>
                          </div>

                          {/* Opponent Vote */}
                          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-medium">{battle.opponent.username}</span>
                              {userVotes[battle.id] === battle.opponent_id && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  Your Vote
                                </Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleVote(battle.opponent_id)}
                              className={`w-full ${
                                userVotes[battle.id] === battle.opponent_id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                              }`}
                            >
                              <Flame className="w-4 h-4 mr-2" />
                              {userVotes[battle.id] === battle.opponent_id ? 'Voted' : 'Vote'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-400 text-sm mb-4">Sign in to vote in this battle</p>
                          <Link href="/auth">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                              Sign In to Vote
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Challenger */}
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={battle.challenger.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {battle.challenger.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{battle.challenger.username}</span>
                      {battle.challenger.is_verified && (
                        <Badge className="h-3 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">✓</Badge>
                      )}
                    </div>
                    <div className={`text-xs ${getRankColor(battle.challenger.rank)}`}>
                      {battle.challenger.rank}
                    </div>
                  </div>
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={battle.opponent.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {battle.opponent.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{battle.opponent.username}</span>
                      {battle.opponent.is_verified && (
                        <Badge className="h-3 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">✓</Badge>
                      )}
                    </div>
                    <div className={`text-xs ${getRankColor(battle.opponent.rank)}`}>
                      {battle.opponent.rank}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battle Status */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Battle Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <Badge className={
                      battle.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      battle.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }>
                      {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                    </Badge>
                  </div>
                                     <div className="flex items-center justify-between">
                     <span className="text-gray-400 text-sm">Total Votes</span>
                     <span className="text-white font-medium">
                       {user && userVotes[battle.id] ? totalVotes.toLocaleString() : 'Vote to see'}
                     </span>
                   </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Time Left</span>
                    <span className="text-white font-medium">{formatTimeLeft(battle.ends_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lyrics Tabs */}
        {(battle.challenger_lyrics || battle.opponent_lyrics) && (
          <div className="mt-8">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Lyrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/30">
                    <TabsTrigger value="challenger" className="text-white">
                      {battle.challenger.username}
                    </TabsTrigger>
                    <TabsTrigger value="opponent" className="text-white">
                      {battle.opponent.username}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="challenger" className="mt-4">
                    {battle.challenger_lyrics ? (
                      <div className="bg-black/30 rounded-lg p-4">
                        <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                          {battle.challenger_lyrics}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No lyrics added yet
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="opponent" className="mt-4">
                    {battle.opponent_lyrics ? (
                      <div className="bg-black/30 rounded-lg p-4">
                        <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                          {battle.opponent_lyrics}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No lyrics added yet
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

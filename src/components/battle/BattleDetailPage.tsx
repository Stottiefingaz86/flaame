'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Flame, 
  Mic, 
  Music, 
  Clock, 
  Users, 
  MessageSquare, 
  Send, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Crown,
  Trophy,
  Calendar,
  Timer,
  Heart,
  Zap,
  Star,
  Share
} from 'lucide-react'
import BattleWave from './BattleWave'
import { User } from '@supabase/supabase-js'

interface BattleEntry {
  id: string
  rapper: {
    id: string
    name: string
    avatar: string
    flames: number
    isVerified: boolean
    rank: string
  }
  audioUrl: string
  lyrics: string
  voteCount: number
  createdAt: Date
}

interface Beat {
  id: string
  title: string
  artist: string
  duration: string
  bpm: number
  key: string
  genre: string
}

interface Comment {
  id: string
  user: {
    id: string
    name: string
    avatar: string
    flames: number
    isVerified: boolean
    rank: string
  }
  message: string
  timestamp: Date
  hasVoted: boolean
}

interface Battle {
  id: string
  title: string
  status: 'active' | 'closed' | 'pending'
  createdAt: Date
  endsAt: Date
  totalVotes: number
  beat: Beat
  entries: BattleEntry[]
  comments: Comment[]
}

interface BattleDetailPageProps {
  battle: Battle
  user: User | null
  hasVoted: boolean
}

export default function BattleDetailPage({ battle, user, hasVoted }: BattleDetailPageProps) {
  const [selectedEntry, setSelectedEntry] = useState<BattleEntry | null>(null)
  const [showLyrics, setShowLyrics] = useState(false)
  const [comment, setComment] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  const formatTimeLeft = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleVote = async (entryId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth'
      return
    }

    try {
      const response = await fetch(`/api/battle/${battle.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryId }),
      })

      if (response.ok) {
        // Refresh the page to show updated vote counts
        window.location.reload()
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleComment = async () => {
    if (!user || !comment.trim()) return

    try {
      const response = await fetch(`/api/battle/${battle.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: comment.trim() }),
      })

      if (response.ok) {
        setComment('')
        // Refresh comments
        window.location.reload()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legendary': return 'text-yellow-400'
      case 'Veteran': return 'text-blue-400'
      case 'Rising': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const canComment = user && hasVoted

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Battle Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{battle.title}</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(battle.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>{formatTimeLeft(battle.endsAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{battle.totalVotes} votes</span>
              </div>
            </div>
          </div>
          <Badge 
            className={`px-4 py-2 text-sm font-medium ${
              battle.status === 'active' 
                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            }`}
          >
            {battle.status === 'active' ? 'Active' : 'Closed'}
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Beat Information */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5" />
                Beat Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Title</p>
                  <p className="text-white font-medium">{battle.beat.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Artist</p>
                  <p className="text-white font-medium">{battle.beat.artist}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="text-white font-medium">{battle.beat.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">BPM</p>
                  <p className="text-white font-medium">{battle.beat.bpm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Key</p>
                  <p className="text-white font-medium">{battle.beat.key}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Genre</p>
                  <p className="text-white font-medium">{battle.beat.genre}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battle Entries */}
          <div className="space-y-6">
            {battle.entries.map((entry, index) => (
              <Card key={entry.id} className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://i.pravatar.cc/100?img=${entry.rapper.avatar}`} />
                          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            {entry.rapper.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">{entry.rapper.name}</h3>
                            {entry.rapper.isVerified && (
                              <Badge className="h-4 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                                ✓
                              </Badge>
                            )}
                            <span className={`text-sm ${getRankColor(entry.rapper.rank)}`}>
                              {entry.rapper.rank}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Flame className="w-4 h-4" />
                            <span>{entry.rapper.flames} flames</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{entry.voteCount}</div>
                      <div className="text-sm text-gray-400">votes</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Audio Player */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <BattleWave 
                      audioUrl={entry.audioUrl}
                      isPlaying={isPlaying === entry.id}
                      onPlay={() => setIsPlaying(entry.id)}
                      onPause={() => setIsPlaying(null)}
                    />
                  </div>

                  {/* Lyrics Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Lyrics</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                        className="text-gray-400 hover:text-white"
                      >
                        {selectedEntry?.id === entry.id ? 'Hide' : 'Show'} Full Lyrics
                      </Button>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      {selectedEntry?.id === entry.id ? (
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                          {entry.lyrics}
                        </pre>
                      ) : (
                        <p className="text-sm text-gray-400">
                          {entry.lyrics.split('\n')[0]}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vote Button */}
                  {battle.status === 'active' && !hasVoted && user && (
                    <Button
                      onClick={() => handleVote(entry.id)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      Vote for {entry.rapper.name} (1 Flame)
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comments Section */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({battle.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment Input */}
              {user ? (
                <div className="space-y-2">
                  {!hasVoted ? (
                    <div className="text-center py-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        Vote first to leave a comment and join the discussion!
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts on this battle..."
                        className="flex-1 bg-black/20 border-white/10 text-white placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                      />
                      <Button
                        onClick={handleComment}
                        disabled={!comment.trim()}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    Sign in to vote and leave comments
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-white/20 hover:bg-white/10">
                    Sign In
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {battle.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={`https://i.pravatar.cc/100?img=${comment.user.avatar}`} />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                        {comment.user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{comment.user.name}</span>
                        {comment.user.isVerified && (
                          <Badge className="h-3 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                            ✓
                          </Badge>
                        )}
                        <span className={`text-xs ${getRankColor(comment.user.rank)}`}>
                          {comment.user.rank}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.timestamp)}
                        </span>
                        {comment.hasVoted && (
                          <Badge className="h-3 px-1 text-xs bg-green-500/20 text-green-300 border-green-500/30">
                            Voted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{comment.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Battle Stats */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Battle Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Votes</span>
                <span className="text-white font-semibold">{battle.totalVotes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Comments</span>
                <span className="text-white font-semibold">{battle.comments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Time Left</span>
                <span className="text-white font-semibold">{formatTimeLeft(battle.endsAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vote Results (if voted or battle closed) */}
          {(hasVoted || battle.status === 'closed') && (
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Vote Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {battle.entries.map((entry) => {
                  const percentage = battle.totalVotes > 0 
                    ? Math.round((entry.voteCount / battle.totalVotes) * 100) 
                    : 0
                  
                  return (
                    <div key={entry.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{entry.rapper.name}</span>
                        <span className="text-sm text-gray-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">{entry.voteCount} votes</div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                <Share className="w-4 h-4 mr-2" />
                Share Battle
              </Button>
              <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                <Heart className="w-4 h-4 mr-2" />
                Follow Battle
              </Button>
              <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                <Star className="w-4 h-4 mr-2" />
                Rate Beat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

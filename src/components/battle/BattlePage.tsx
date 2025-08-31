'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BattleWave from './BattleWave'
import VoteGate from './VoteGate'
import LyricsPanel from './LyricsPanel'
import SponsorRail from './SponsorRail'
import { Battle, BattleEntry } from '@/lib/db'
import { Flame, Users, Clock, Trophy } from 'lucide-react'

interface BattlePageProps {
  battle: Battle
  entries: BattleEntry[]
  sponsors: {
    hero: any[]
    sidebar: any[]
    footer: any[]
  }
  hasVoted: boolean
  voteResults: Record<string, number>
  currentUserId?: string
}

export default function BattlePage({
  battle,
  entries,
  sponsors,
  hasVoted,
  voteResults,
  currentUserId
}: BattlePageProps) {
  const [selectedEntry, setSelectedEntry] = useState<BattleEntry | null>(null)
  const [showLyrics, setShowLyrics] = useState(false)

  const formatTimeLeft = () => {
    const now = new Date()
    const endsAt = new Date(battle.ends_at)
    const diff = endsAt.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getStatusColor = () => {
    switch (battle.status) {
      case 'ACTIVE': return 'text-green-400'
      case 'VOTING': return 'text-yellow-400'
      case 'CLOSED': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getWinner = () => {
    if (battle.status !== 'CLOSED' || !battle.winner_id) return null
    return entries.find(entry => entry.user_id === battle.winner_id)
  }

  const winner = getWinner()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Sponsor */}
      {sponsors.hero.length > 0 && (
        <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-3">
            <SponsorRail sponsors={sponsors.hero} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Battle Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold text-white mb-2">
                        {battle.title}
                      </CardTitle>
                      {battle.description && (
                        <p className="text-gray-300">{battle.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor()}`}>
                        {battle.status}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeLeft()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Battle Stats */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {entries.length} Entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {battle.total_votes} Votes
                    </div>
                    {winner && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        Winner: {winner.user.username}
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Battle Entries */}
            <div className="space-y-6">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-black/20 backdrop-blur-md border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                            {entry.user.profile_icon || entry.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {entry.user.username}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {entry.beat.title} by {entry.beat.artist}
                            </p>
                          </div>
                        </div>
                        
                        {/* Vote Results (if available) */}
                        {hasVoted && voteResults[entry.id] !== undefined && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {voteResults[entry.id]}
                            </div>
                            <div className="text-gray-400 text-sm">votes</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Audio Player */}
                      <BattleWave
                        audioUrl={entry.audio_url}
                        entryId={entry.id}
                        isOwner={currentUserId === entry.user_id}
                      />
                      
                      {/* Lyrics Toggle */}
                      {entry.lyrics && (
                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedEntry(entry)
                              setShowLyrics(true)
                            }}
                            className="text-gray-300 hover:text-white"
                          >
                            View Lyrics
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Vote Gate */}
            {battle.status === 'VOTING' && !hasVoted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <VoteGate
                  battleId={battle.id}
                  entries={entries}
                  onVoteComplete={() => window.location.reload()}
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sidebar Sponsors */}
            {sponsors.sidebar.length > 0 && (
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardContent className="p-4">
                  <SponsorRail sponsors={sponsors.sidebar} />
                </CardContent>
              </Card>
            )}

            {/* Battle Info */}
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Battle Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={getStatusColor()}>{battle.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entries:</span>
                  <span className="text-white">{entries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Votes:</span>
                  <span className="text-white">{battle.total_votes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ends:</span>
                  <span className="text-white">{formatTimeLeft()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Sponsors */}
      {sponsors.footer.length > 0 && (
        <div className="w-full bg-black/20 backdrop-blur-sm border-t border-white/10 mt-12">
          <div className="container mx-auto px-4 py-6">
            <SponsorRail sponsors={sponsors.footer} />
          </div>
        </div>
      )}

      {/* Lyrics Modal */}
      {showLyrics && selectedEntry && (
        <LyricsPanel
          entry={selectedEntry}
          isOpen={showLyrics}
          onClose={() => setShowLyrics(false)}
          isOwner={currentUserId === selectedEntry.user_id}
        />
      )}
    </div>
  )
}

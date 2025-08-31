'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BattleEntry } from '@/lib/db'
import { Flame, Lock, Vote } from 'lucide-react'

interface VoteGateProps {
  battleId: string
  entries: BattleEntry[]
  onVoteComplete: () => void
}

export default function VoteGate({ battleId, entries, onVoteComplete }: VoteGateProps) {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVote = async () => {
    if (!selectedEntry) return

    setIsVoting(true)
    setError(null)

    try {
      const response = await fetch(`/api/battle/${battleId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: selectedEntry,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to vote')
      }

      // Vote successful
      onVoteComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 border-2 border-yellow-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-yellow-500" />
            <CardTitle className="text-white">Cast Your Vote</CardTitle>
          </div>
          <p className="text-gray-300 text-sm">
            Vote results are hidden until you participate. Choose your favorite entry below.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Vote Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedEntry === entry.id
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                      : 'bg-black/20 border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => setSelectedEntry(entry.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                        {entry.user.profile_icon || entry.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">
                          {entry.user.username}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {entry.beat.title}
                        </p>
                      </div>
                      {selectedEntry === entry.id && (
                        <Vote className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Vote Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Voting costs 1 🔥 flame</span>
            </div>
            
            <Button
              onClick={handleVote}
              disabled={!selectedEntry || isVoting}
              variant="flame"
              className="px-8"
            >
              {isVoting ? (
                'Voting...'
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  Vote for {selectedEntry ? entries.find(e => e.id === selectedEntry)?.user.username : 'Entry'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

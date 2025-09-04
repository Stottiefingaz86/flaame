import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

interface BattleCardProps {
  battle: any
  onAcceptBattle: (battle: any) => void
  onVote: (battleId: string, vote: 'challenger' | 'opponent') => void
  hasVoted: boolean
  userVote: string | undefined
}

export default function BattleCard({ battle, onAcceptBattle, onVote, hasVoted, userVote }: BattleCardProps) {
  const { user } = useUser()
  const [timeLeft, setTimeLeft] = useState<string>('')

  // Get battle style from title
  const getBattleStyle = (title: string) => {
    if (title.toLowerCase().includes('flame')) {
      return { type: 'Flame', emoji: '🔥', color: 'bg-red-500/10 text-red-300 border-red-500/20' }
    } else if (title.toLowerCase().includes('freestyle')) {
      return { type: 'Freestyle', emoji: '🎤', color: 'bg-green-500/10 text-green-300 border-green-500/20' }
    } else if (title.toLowerCase().includes('story')) {
      return { type: 'Story', emoji: '📖', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' }
    } else {
      return { type: 'Battle', emoji: '⚔️', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' }
    }
  }

  // Format time remaining with minutes and seconds
  const formatTimeLeft = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  // Real-time countdown timer
  useEffect(() => {
    if (!battle.ends_at || battle.status === 'closed') return

    const updateTimer = () => {
      setTimeLeft(formatTimeLeft(battle.ends_at))
    }

    // Update immediately
    updateTimer()

    // Update every second for active battles
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [battle.ends_at, battle.status])

  const battleStyle = getBattleStyle(battle.title)
  const isActive = battle.status === 'active'
  const isOpen = battle.status === 'pending'
  const isFinished = battle.status === 'closed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-7 items-center py-4 px-6 border-b border-white/10 hover:bg-white/5 transition-colors"
    >
      {/* Challenger */}
      <div className="col-span-1 flex items-center gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={battle.challenger?.avatar_id ? `/api/avatars/${battle.challenger.avatar_id}` : undefined} />
          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
            {battle.challenger?.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <Link href={`/profile/${battle.challenger?.username}`} className="hover:underline">
          <span className="text-xs font-medium text-white truncate max-w-[100px] block">
            {battle.challenger?.username}
          </span>
        </Link>
      </div>

      {/* VS Badge - Ghost style with better spacing */}
      <div className="col-span-1 flex items-center justify-center pr-2">
        <Badge variant="ghost" className="bg-white/5 text-white/70 border-white/20 px-4 py-2 text-xs font-medium">
          VS
        </Badge>
      </div>

      {/* Opponent */}
      <div className="col-span-1 flex items-center gap-3">
        {battle.opponent ? (
          <>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={battle.opponent?.avatar_id ? `/api/avatars/${battle.opponent.avatar_id}` : undefined} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                {battle.opponent?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Link href={`/profile/${battle.opponent?.username}`} className="hover:underline">
              <span className={`text-xs font-medium truncate max-w-[100px] block ${
                battle.status === 'challenge' ? 'text-gray-500' : 'text-white'
              }`}>
                {battle.opponent?.username}
              </span>
            </Link>
          </>
        ) : (
          <span className="text-sm text-gray-400">Waiting...</span>
        )}
      </div>

      {/* Type - Country flag + Style in same tag */}
      <div className="col-span-1 flex items-center justify-center">
        <Badge variant="ghost" className="bg-white/5 text-white/70 border-white/20 px-3 py-1 text-xs flex items-center gap-2">
          <span>🇺🇸</span>
          <span>{battleStyle.type}</span>
        </Badge>
      </div>

      {/* Status */}
      <div className="col-span-1 flex items-center justify-center">
        {isActive && (
          <Badge variant="ghost" className="bg-green-500/10 text-green-300 border-green-500/20 text-xs">
            Active
          </Badge>
        )}
        {battle.status === 'challenge' && (
          <Badge variant="ghost" className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
            Challenge
          </Badge>
        )}
        {isOpen && (
          <Badge variant="ghost" className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-xs">
            Open
          </Badge>
        )}
        {isFinished && (
          <Badge variant="ghost" className="bg-gray-500/10 text-gray-300 border-gray-500/20 text-xs">
            Finished
          </Badge>
        )}
      </div>

      {/* Finished in */}
      <div className="col-span-1 flex items-center justify-center">
        {isActive && battle.ends_at ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </div>

      {/* Play Button - Last column, the call to action */}
      <div className="col-span-1 flex items-center justify-center">
        <Link href={`/battle/${battle.id}`}>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/20"
          >
            <Play className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

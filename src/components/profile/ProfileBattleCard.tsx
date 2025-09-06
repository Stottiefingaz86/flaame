import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Clock, Trophy } from 'lucide-react'
import Link from 'next/link'

interface ProfileBattleCardProps {
  battle: {
    id: string
    title: string
    status: string
    created_at: string
    opponent_username?: string
    result?: string
  }
  user: {
    username: string
    id: string
    avatar_id?: string
  }
}

export default function ProfileBattleCard({ battle, user }: ProfileBattleCardProps) {
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

  // Format time remaining
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
    const updateTimer = () => {
      if (battle.status === 'active' && battle.created_at) {
        setTimeLeft(formatTimeLeft(battle.created_at))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [battle.status, battle.created_at])

  const battleStyle = getBattleStyle(battle.title)
  const isActive = battle.status === 'active'
  const isOpen = battle.status === 'challenge'
  const isFinished = battle.status === 'finished'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-7 items-center py-4 px-6 border-b border-white/10 hover:bg-white/5 transition-colors"
    >
      {/* Challenger */}
      <div className="col-span-1 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_id ? `/api/avatars/${encodeURIComponent(user.avatar_id)}` : undefined} />
          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-white font-medium text-sm truncate">{user.username}</span>
      </div>

      {/* VS */}
      <div className="col-span-1 flex items-center justify-center">
        <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20 text-xs px-2 py-1">
          VS
        </Badge>
      </div>

      {/* Opponent */}
      <div className="col-span-1 flex items-center gap-3">
        {battle.opponent_username ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                {battle.opponent_username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-white font-medium text-sm truncate">{battle.opponent_username}</span>
          </>
        ) : (
          <span className="text-gray-500 text-sm">Waiting...</span>
        )}
      </div>

      {/* Type */}
      <div className="col-span-1 flex items-center justify-center">
        <Badge variant="outline" className={`${battleStyle.color} text-xs`}>
          {battleStyle.emoji} {battleStyle.type}
        </Badge>
      </div>

      {/* Status */}
      <div className="col-span-1 flex items-center justify-center">
        {isActive && (
          <Badge variant="ghost" className="bg-green-500/10 text-green-300 border-green-500/20 text-xs">
            Active
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

      {/* Time */}
      <div className="col-span-1 flex items-center justify-center">
        {isActive && battle.created_at ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </div>

      {/* Play Button */}
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


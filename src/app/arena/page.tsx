'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Flame, 
  Music, 
  Crown, 
  Users, 
  Trophy, 
  Play, 
  Pause, 
  Clock, 
  Plus,
  Mic,
  Headphones,
  TrendingUp,
  Calendar,
  Timer,
  ArrowRight,
  ChevronDown,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLeague } from '@/contexts/LeagueContext'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import CreateBattleModal from '@/components/battle/CreateBattleModal'

// Mock data with 6-day creation periods
const mockBattles = [
  {
    id: '1',
    title: 'Season 1 - Week 3',
    status: 'ACTIVE',
    challenger: { name: 'Nova', avatar: 'N', flames: 12450 },
    opponent: { name: 'Kairo', avatar: 'K', flames: 9870 },
    beat: { title: 'Midnight Flow', artist: 'Prod. Nova' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    totalVotes: 2360,
    progress: 52
  },
  {
    id: '2',
    title: 'Open Challenge',
    status: 'OPEN',
    challenger: { name: 'Lyricist', avatar: 'L', flames: 6890 },
    opponent: null,
    beat: { title: 'Street Dreams', artist: 'Prod. Beats' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    totalVotes: 0,
    progress: 0
  },
  {
    id: '3',
    title: 'Season 1 - Week 2',
    status: 'FINISHED',
    challenger: { name: 'Flow Master', avatar: 'F', flames: 8230 },
    opponent: { name: 'Rhyme King', avatar: 'R', flames: 7450 },
    beat: { title: 'Urban Nights', artist: 'Prod. Urban', bpm: 95 },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    totalVotes: 3900,
    progress: 54,
    winner: 'Flow Master'
  },
  {
    id: '4',
    title: 'Weekend Showdown',
    status: 'ACTIVE',
    challenger: { name: 'Beat Breaker', avatar: 'B', flames: 6230 },
    opponent: { name: 'Word Smith', avatar: 'W', flames: 5670 },
    beat: { title: 'Weekend Vibes', artist: 'Prod. Weekend', bpm: 90 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    totalVotes: 1850,
    progress: 48
  }
]

const wave = (
  <div className="flex items-end gap-0.5 h-12 w-full overflow-hidden">
    {Array.from({ length: 64 }).map((_, i) => (
      <div
        key={i}
        className="w-1 rounded-full bg-white/30"
        style={{ height: `${8 + Math.abs(Math.sin(i)) * 32}px` }}
      />
    ))}
  </div>
)

function formatTimeLeft(endDate: Date): string {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  
  if (diff <= 0) return 'Ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatCreationTime(createdDate: Date): string {
  const now = new Date()
  const diff = now.getTime() - createdDate.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Created today'
  if (days === 1) return 'Created yesterday'
  return `Created ${days} days ago`
}

function BattleCard({ battle }: { battle: typeof mockBattles[0] }) {
  const { user } = useUser()
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [voteAnimation, setVoteAnimation] = useState<string | null>(null)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const isActive = battle.status === 'ACTIVE'
  const isOpen = battle.status === 'OPEN'
  const isFinished = battle.status === 'FINISHED'

  // Check if user has already voted (in real app, this would come from database)
  useEffect(() => {
    if (user) {
      // Simulate checking if user has voted
      // In real app: check database for existing vote
      const existingVote = localStorage.getItem(`vote_${battle.id}_${user.id}`)
      if (existingVote) {
        setHasVoted(true)
        setUserVote(existingVote)
      }
    }
  }, [user, battle.id])

  // Real-time countdown timer
  useEffect(() => {
    if (!battle.endsAt || isFinished) return

    const updateTimer = () => {
      const now = new Date()
      const endTime = new Date(battle.endsAt)
      const diff = endTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`)
      } else {
        setTimeLeft(`${minutes}m left`)
      }
    }

    // Update immediately
    updateTimer()

    // Update every minute
    const interval = setInterval(updateTimer, 60000)

    return () => clearInterval(interval)
  }, [battle.endsAt, isFinished])

  const handleVote = async (candidateId: string, candidateName: string) => {
    if (!user || isVoting || hasVoted) return
    
    setIsVoting(true)
    setVoteAnimation(candidateId)
    
    try {
      // Here you would call your voting API
      console.log(`Voting for ${candidateName} (${candidateId})`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Store vote locally (in real app, this would be in database)
      localStorage.setItem(`vote_${battle.id}_${user.id}`, candidateId)
      
      setHasVoted(true)
      setUserVote(candidateId)
      
      // Clear animation after a delay
      setTimeout(() => setVoteAnimation(null), 2000)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 overflow-hidden hover:bg-black/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://i.pravatar.cc/100?img=${battle.challenger.avatar}`} />
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                {battle.challenger.avatar}
              </AvatarFallback>
            </Avatar>
            <Link href={`/profile/${battle.challenger.name.toLowerCase()}`} className="text-sm font-semibold text-white hover:text-orange-400 transition-colors">
              {battle.challenger.name}
            </Link>
            <span className="text-xs text-gray-400">vs</span>
            {battle.opponent ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://i.pravatar.cc/100?img=${battle.opponent.avatar}`} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {battle.opponent.avatar}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/profile/${battle.opponent.name.toLowerCase()}`} className="text-sm font-semibold text-white hover:text-orange-400 transition-colors">
                  {battle.opponent.name}
                </Link>
              </>
            ) : (
              <span className="text-sm text-gray-400">Waiting for challenger...</span>
            )}

          </div>
          <div className="flex items-center gap-2">
            {isOpen && <Badge className="rounded-full bg-green-500/20 text-green-300 border-green-500/30">Open</Badge>}
            {isActive && battle.endsAt && timeLeft && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Timer className="h-3.5 w-3.5" /> {timeLeft}
              </div>
            )}
            {isFinished && (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <Badge className="rounded-full bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {battle.winner} won
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-5 pb-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white mb-1">{battle.title}</h3>
            <p className="text-sm text-gray-400">{battle.beat.title} by {battle.beat.artist}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatCreationTime(battle.createdAt)}
              </span>
              {isActive && battle.endsAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Ends {battle.endsAt.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {battle.opponent && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Challenger */}
              <div className="rounded-xl border border-white/10 p-3 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                        {battle.challenger.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white">{battle.challenger.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                {wave}
                {user && (
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-400">{battle.challenger.flames.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              {/* Opponent */}
              <div className="rounded-xl border border-white/10 p-3 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                        {battle.opponent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white">{battle.opponent.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                {wave}
                {user && (
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-400">{battle.opponent.flames.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vote meter - only show after user has voted */}
          {battle.opponent && user && hasVoted && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{battle.challenger.name}: {battle.challenger.flames} flames</span>
                <span>{battle.opponent.name}: {battle.opponent.flames} flames</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-white/60 h-2 rounded-full" 
                  style={{ width: `${battle.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
        
        <div className="px-5 pb-5">
          {isOpen ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-sm text-gray-400">Open challenge — accept to lock in.</span>
              <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30">
                Accept Battle
              </Button>
            </div>
          ) : isActive ? (
            <div className="w-full space-y-3">
              {user ? (
                hasVoted ? (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-sm text-green-400 mb-2 flex items-center justify-center gap-2"
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        ✓
                      </motion.div>
                      Vote submitted for {userVote === 'challenger' ? battle.challenger.name : battle.opponent?.name}!
                    </motion.div>
                    <div className="text-xs text-gray-400">Thank you for voting</div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-400">Cast your vote:</div>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="flex-1"
                        animate={voteAnimation === 'challenger' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Button 
                          variant="outline" 
                          className={`w-full rounded-xl border-white/20 hover:bg-white/10 disabled:opacity-50 ${
                            voteAnimation === 'challenger' ? 'bg-green-500/20 border-green-500/50' : ''
                          }`}
                          onClick={() => handleVote('challenger', battle.challenger.name)}
                          disabled={isVoting}
                        >
                          <motion.div
                            animate={voteAnimation === 'challenger' ? { rotate: 360 } : {}}
                            transition={{ duration: 1, repeat: isVoting ? Infinity : 0 }}
                          >
                            <Flame className="h-4 w-4 mr-2" />
                          </motion.div>
                          {isVoting && voteAnimation === 'challenger' ? 'Voting...' : `Vote for ${battle.challenger.name}`}
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        className="flex-1"
                        animate={voteAnimation === 'opponent' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Button 
                          variant="outline" 
                          className={`w-full rounded-xl border-white/20 hover:bg-white/10 disabled:opacity-50 ${
                            voteAnimation === 'opponent' ? 'bg-green-500/20 border-green-500/50' : ''
                          }`}
                          onClick={() => handleVote('opponent', battle.opponent?.name || 'Opponent')}
                          disabled={isVoting}
                        >
                          <motion.div
                            animate={voteAnimation === 'opponent' ? { rotate: 360 } : {}}
                            transition={{ duration: 1, repeat: isVoting ? Infinity : 0 }}
                          >
                            <Flame className="h-4 w-4 mr-2" />
                          </motion.div>
                          {isVoting && voteAnimation === 'opponent' ? 'Voting...' : `Vote for ${battle.opponent?.name}`}
                        </Button>
                      </motion.div>
                    </div>
                  </>
                )
              ) : (
                <div className="text-sm text-gray-400">Sign in to vote</div>
              )}
              <Link href={`/battles/${battle.id}`}>
                <Button variant="ghost" className="w-full rounded-xl text-white hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Battle Details
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-yellow-400" />
                Winner: <span className="font-semibold ml-1 text-white">{battle.winner}</span>
              </div>
              <Link href={`/battles/${battle.id}`}>
                <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default function ArenaPage() {
  const { currentLeague, leagues, setCurrentLeague } = useLeague()
  const [activeTab, setActiveTab] = useState('active')
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [finishedFilter, setFinishedFilter] = useState('all') // 'all', '30days', 'season1', 'season2'
  const [showCreateBattleModal, setShowCreateBattleModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLeagueDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter battles by current league and search query
  const getFilteredBattles = () => {
    let filtered = mockBattles
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(battle => 
        battle.title.toLowerCase().includes(query) ||
        battle.challenger.name.toLowerCase().includes(query) ||
        battle.opponent?.name.toLowerCase().includes(query) ||
        battle.beat.title.toLowerCase().includes(query) ||
        battle.beat.artist.toLowerCase().includes(query)
      )
    }
    
    // Filter by active tab
    switch (activeTab) {
      case 'active':
        return filtered.filter(b => b.status === 'ACTIVE')
      case 'open':
        return filtered.filter(b => b.status === 'OPEN')
      case 'finished':
        let finishedBattles = filtered.filter(b => b.status === 'FINISHED')
        
        // Apply additional filters for finished battles
        if (finishedFilter === '30days') {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          finishedBattles = finishedBattles.filter(battle => new Date(battle.createdAt) >= thirtyDaysAgo)
        } else if (finishedFilter === 'season1') {
          finishedBattles = finishedBattles.filter(battle => battle.title.includes('Season 1'))
        } else if (finishedFilter === 'season2') {
          finishedBattles = finishedBattles.filter(battle => battle.title.includes('Season 2'))
        }
        
        return finishedBattles
      default:
        return filtered
    }
  }

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-6">Battle Arena</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Compete in epic rap battles, earn flames, and climb the leaderboard. 
            Each battle runs for 6 days from creation - create new challenges or accept existing ones.
          </p>
          <div className="flex items-center justify-center">
            <Button 
              size="lg" 
              className="px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              onClick={() => setShowCreateBattleModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Battle
            </Button>
          </div>
        </motion.div>

        {/* Search, Tabs, and League Filter - All on One Line */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            {/* Search Icon/Bar */}
            <div className="relative">
              {!isSearchExpanded ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchExpanded(true)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <Search className="w-5 h-5" />
                </Button>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-64 pl-10 pr-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="Search battles, artists, beats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => {
                      // Keep expanded if there's text, collapse if empty
                      if (!searchQuery.trim()) {
                        setIsSearchExpanded(false)
                      }
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white" value="active">
                  Active Battles
                </TabsTrigger>
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white" value="open">
                  Open Challenges
                </TabsTrigger>
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white" value="finished">
                  Finished
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* League Filter */}
            {leagues.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  className="bg-black/20 backdrop-blur-md border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-xl"
                  onClick={() => setIsLeagueDropdownOpen(!isLeagueDropdownOpen)}
                >
                  <span className="mr-2">{currentLeague?.flag_emoji || '🏴󠁧󠁢󠁥󠁮󠁧󠁿'}</span>
                  {currentLeague?.name || 'US/UK League'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                
                {isLeagueDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-2">
                      {leagues.map((league) => (
                        <button
                          key={league.id}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors ${
                            currentLeague?.id === league.id ? 'bg-white/10' : ''
                          }`}
                          onClick={() => {
                            setCurrentLeague(league)
                            setIsLeagueDropdownOpen(false)
                          }}
                        >
                          <span className="text-lg">{league.flag_emoji}</span>
                          <span className="text-white">{league.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            <TabsContent value="active" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockBattles.filter(b => b.status === 'ACTIVE').map((battle) => (
                  <BattleCard key={battle.id} battle={battle} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="open" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockBattles.filter(b => b.status === 'OPEN').map((battle) => (
                  <BattleCard key={battle.id} battle={battle} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="finished" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockBattles.filter(b => b.status === 'FINISHED').map((battle) => (
                  <BattleCard key={battle.id} battle={battle} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sticky Create Battle Button */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button 
          size="lg" 
          className="rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-transform duration-200 bg-white/20 hover:bg-white/30 text-white border border-white/30"
          onClick={() => setShowCreateBattleModal(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Create Battle Modal */}
      <CreateBattleModal
        isOpen={showCreateBattleModal}
        onClose={() => setShowCreateBattleModal(false)}
        onBattleCreated={() => {
          // Refresh battles or show success message
          console.log('Battle created successfully!')
        }}
      />
    </div>
  )
}

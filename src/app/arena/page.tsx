'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Search,
  ChevronDown,
  Users,
  Trophy,
  Filter,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLeague } from '@/contexts/LeagueContext'
import { useUser } from '@/contexts/UserContext'
import CreateBattleModal from '@/components/battle/CreateBattleModal'
import AcceptBattleModal from '@/components/arena/BattleCard'
import BattleCard from '@/components/arena/BattleCard'

// Battle interface
interface Battle {
  id: string
  title: string
  status: 'pending' | 'challenge' | 'active' | 'closed' | 'cancelled'
  challenger_id: string
  opponent_id?: string
  beat_id: string
  created_at: string
  ends_at: string
  challenger_votes: number
  opponent_votes: number
  challenger?: {
    id: string
    username: string
    avatar_id?: string
    flames: number
  }
  opponent?: {
    id: string
    username: string
    avatar_id?: string
    flames: number
  }
  beat?: {
    id: string
    title: string
    artist: string
  }
}

export default function ArenaPage() {
  const { currentLeague, leagues, setCurrentLeague } = useLeague()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('all')
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [finishedFilter, setFinishedFilter] = useState('all')
  const [showCreateBattleModal, setShowCreateBattleModal] = useState(false)
  const [showAcceptBattleModal, setShowAcceptBattleModal] = useState(false)
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load battles from database
  useEffect(() => {
    loadBattles()
  }, [])

  const loadBattles = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('battles')
        .select(`
          *,
          challenger:profiles!battles_challenger_id_fkey(id, username, avatar_id, flames),
          opponent:profiles!battles_opponent_id_fkey(id, username, avatar_id, flames),
          beat:beats(id, title, artist)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBattles(data || [])
    } catch (error) {
      console.error('Error loading battles:', error)
      setBattles([])
    } finally {
      setIsLoading(false)
    }
  }

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
    let filtered = battles
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(battle => 
        battle.title.toLowerCase().includes(query) ||
        battle.challenger?.username.toLowerCase().includes(query) ||
        battle.opponent?.username.toLowerCase().includes(query) ||
        battle.beat?.title.toLowerCase().includes(query) ||
        battle.beat?.artist.toLowerCase().includes(query)
      )
    }
    
    // Filter by active tab
    switch (activeTab) {
      case 'all':
        // Show all battles except finished ones
        return filtered.filter(b => b.status !== 'closed')
      case 'active':
        return filtered.filter(b => b.status === 'active' || b.status === 'challenge')
      case 'open':
        return filtered.filter(b => b.status === 'pending')
      case 'finished':
        let finishedBattles = filtered.filter(b => b.status === 'closed')
        
        // Apply additional filters for finished battles
        if (finishedFilter === '30days') {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          finishedBattles = finishedBattles.filter(battle => new Date(battle.created_at) >= thirtyDaysAgo)
        } else if (finishedFilter === 'season1') {
          finishedBattles = finishedBattles.filter(battle => battle.title.includes('Season 1'))
        } else if (finishedFilter === 'season2') {
          finishedBattles = finishedBattles.filter(battle => battle.title.includes('Season 2'))
        }
        
        return finishedBattles
      default:
        return filtered
    }
    
    // Apply sorting based on filter
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'soonToFinish':
        return filtered.sort((a, b) => {
          if (!a.ends_at || !b.ends_at) return 0
          return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()
        })
      case 'byLeague':
        // Sort by league (you can implement league-specific sorting here)
        return filtered.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return filtered
    }
  }

  // Handle accepting a battle
  const handleAcceptBattle = (battle: any) => {
    if (!user) {
      alert('You must be logged in to accept a battle')
      return
    }
    setSelectedBattle(battle)
    setShowAcceptBattleModal(true)
  }

  // Handle voting on a battle
  const handleVote = async (battleId: string, vote: 'challenger' | 'opponent') => {
    if (!user) {
      alert('You must be logged in to vote')
      return
    }
    
    try {
      // TODO: Implement voting logic
      console.log(`Voting ${vote} for battle ${battleId}`)
      alert('Voting feature coming soon!')
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:pl-8 lg:pr-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Battle Arena</h1>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl">
            Compete in epic rap battles, earn flames, and climb the leaderboard. 
            Find the perfect sound for your next track or battle.
          </p>
          {user && (
            <div className="flex items-center gap-4">
              <Button 
                size="lg" 
                className="px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                onClick={() => setShowCreateBattleModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Battle
              </Button>
            </div>
          )}
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
                    className="w-64 pl-10 pr-12 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="Search battles, users, beats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsSearchExpanded(false)
                      setSearchQuery('')
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Filter Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`${isFilterExpanded ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <Filter className="w-5 h-5" />
            </Button>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
                <TabsTrigger className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white" value="all">
                  All Battles
                </TabsTrigger>
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

            {/* League Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                onClick={() => setIsLeagueDropdownOpen(!isLeagueDropdownOpen)}
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <span>{currentLeague?.name || 'US/UK League'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLeagueDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isLeagueDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-2 min-w-[200px] z-50"
                >
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => {
                        setCurrentLeague(league)
                        setIsLeagueDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentLeague?.id === league.id ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {league.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Filter Dropdown */}
        {isFilterExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex items-center gap-3"
          >
            <div className="relative">
              <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-3 min-w-[200px]">
                <div className="space-y-2">
                  <button
                    onClick={() => { setSortBy('newest'); setIsFilterExpanded(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'newest' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    🕒 Newest
                  </button>
                  <button
                    onClick={() => { setSortBy('soonToFinish'); setIsFilterExpanded(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'soonToFinish' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    ⏰ Soon to Finish
                  </button>
                  <button
                    onClick={() => { setSortBy('byLeague'); setIsFilterExpanded(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'byLeague' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    🏆 By League
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Battle Listings */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading battles...
                </div>
              ) : getFilteredBattles().length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-3">No Battles Found</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                      No battles found. Create a battle or wait for someone to challenge you!
                    </p>
                    <Button 
                      onClick={() => setShowCreateBattleModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Battle
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-6">
                    <div className="col-span-1 text-center pr-8">Challenger</div>
                    <div className="col-span-1 text-center pr-8">VS</div>
                    <div className="col-span-1 text-center pr-12">Opponent</div>
                    <div className="col-span-1 text-center pr-4">Type</div>
                    <div className="col-span-1 text-center pr-4">Status</div>
                    <div className="col-span-1 text-center pr-4">Finishes</div>
                    <div className="col-span-1 text-center">Play</div>
                  </div>
                  <div>
                    {getFilteredBattles().map((battle) => (
                      <BattleCard 
                        key={battle.id} 
                        battle={battle}
                        onAcceptBattle={handleAcceptBattle}
                        onVote={handleVote}
                        hasVoted={false}
                        userVote={undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading battles...
                </div>
              ) : getFilteredBattles().length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-3">No Active Battles</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                      No battles are currently active. Create a battle or wait for someone to challenge you!
                    </p>
                    <Button 
                      onClick={() => setShowCreateBattleModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Battle
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-6">
                    <div className="col-span-1 text-center pr-8">Challenger</div>
                    <div className="col-span-1 text-center pr-8">VS</div>
                    <div className="col-span-1 text-center pr-12">Opponent</div>
                    <div className="col-span-1 text-center pr-4">Type</div>
                    <div className="col-span-1 text-center pr-4">Status</div>
                    <div className="col-span-1 text-center pr-4">Finishes</div>
                    <div className="col-span-1 text-center">Play</div>
                  </div>
                  <div>
                    {getFilteredBattles().map((battle) => (
                      <BattleCard 
                        key={battle.id} 
                        battle={battle}
                        onAcceptBattle={handleAcceptBattle}
                        onVote={handleVote}
                        hasVoted={false}
                        userVote={undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="open" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading battles...
                </div>
              ) : getFilteredBattles().length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-3">No Open Challenges</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                      No one is looking for a battle right now. Create a challenge and wait for someone to accept!
                    </p>
                    <Button 
                      onClick={() => setShowCreateBattleModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Challenge
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-6">
                    <div className="col-span-1 text-center pr-8">Challenger</div>
                    <div className="col-span-1 text-center pr-8">VS</div>
                    <div className="col-span-1 text-center pr-12">Opponent</div>
                    <div className="col-span-1 text-center pr-4">Type</div>
                    <div className="col-span-1 text-center pr-4">Status</div>
                    <div className="col-span-1 text-center pr-4">Finishes</div>
                    <div className="col-span-1 text-center">Play</div>
                  </div>
                  <div>
                    {getFilteredBattles().map((battle) => (
                      <BattleCard 
                        key={battle.id} 
                        battle={battle}
                        onAcceptBattle={handleAcceptBattle}
                        onVote={handleVote}
                        hasVoted={false}
                        userVote={undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="finished" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading battles...
                </div>
              ) : getFilteredBattles().length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
                    <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-3">No Finished Battles</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                      No battles have been completed yet. Create some battles and let the competition begin!
                    </p>
                    <Button 
                      onClick={() => setShowCreateBattleModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create First Battle
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-6">
                    <div className="col-span-1 text-center pr-8">Challenger</div>
                    <div className="col-span-1 text-center pr-8">VS</div>
                    <div className="col-span-1 text-center pr-12">Opponent</div>
                    <div className="col-span-1 text-center pr-4">Type</div>
                    <div className="col-span-1 text-center pr-4">Status</div>
                    <div className="col-span-1 text-center pr-4">Finishes</div>
                    <div className="col-span-1 text-center">Play</div>
                  </div>
                  <div>
                    {getFilteredBattles().map((battle) => (
                      <BattleCard 
                        key={battle.id} 
                        battle={battle}
                        onAcceptBattle={handleAcceptBattle}
                        onVote={handleVote}
                        hasVoted={false}
                        userVote={undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Battle Modal */}
      <CreateBattleModal
        isOpen={showCreateBattleModal}
        onClose={() => setShowCreateBattleModal(false)}
        onBattleCreated={() => {
          setShowCreateBattleModal(false)
          setShowSuccessMessage(true)
          loadBattles()
          setTimeout(() => setShowSuccessMessage(false), 3000)
        }}
      />

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed top-6 right-6 z-50 bg-green-500/90 backdrop-blur-md border border-green-400/30 rounded-lg p-4 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <p className="text-white font-medium">Success!</p>
              <p className="text-green-200 text-sm">Action completed successfully</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
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
  Timer
} from 'lucide-react'

// Mock data with 6-day creation periods
const mockBattles = [
  {
    id: '1',
    title: 'Season 1 - Week 3',
    status: 'ACTIVE',
    challenger: { name: 'Nova', avatar: 'N', flames: 12450 },
    opponent: { name: 'Kairo', avatar: 'K', flames: 9870 },
    beat: { title: 'Midnight Flow', artist: 'Prod. Nova', bpm: 92 },
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
    beat: { title: 'Street Dreams', artist: 'Prod. Beats', bpm: 88 },
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
  const isActive = battle.status === 'ACTIVE'
  const isOpen = battle.status === 'OPEN'
  const isFinished = battle.status === 'FINISHED'

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
            <span className="text-sm font-semibold text-white">{battle.challenger.name}</span>
            <span className="text-xs text-gray-400">vs</span>
            {battle.opponent ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://i.pravatar.cc/100?img=${battle.opponent.avatar}`} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {battle.opponent.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-white">{battle.opponent.name}</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Waiting for challenger...</span>
            )}
            <Badge variant="secondary" className="ml-2 rounded-full bg-white/10 border-white/15">
              {battle.beat.bpm} BPM
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isOpen && <Badge className="rounded-full bg-green-500/20 text-green-300 border-green-500/30">Open</Badge>}
            {isActive && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Timer className="h-3.5 w-3.5" /> {formatTimeLeft(battle.endsAt)} left
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
              {isActive && (
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
                <div className="flex items-center gap-1 mt-2">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-400">{battle.challenger.flames.toLocaleString()}</span>
                </div>
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
                <div className="flex items-center gap-1 mt-2">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-400">{battle.opponent.flames.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Vote meter */}
          {battle.opponent && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{battle.challenger.name}: {battle.challenger.flames} flames</span>
                <span>{battle.opponent.name}: {battle.opponent.flames} flames</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" 
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
              <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                Accept Battle
              </Button>
            </div>
          ) : isActive ? (
            <div className="w-full flex items-center justify-between">
              <div className="text-sm text-gray-400">Cast your vote with flames.</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-xl border-white/20 hover:bg-white/10">
                  Use 1 Free
                </Button>
                <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Spend Flames
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-yellow-400" />
                Winner: <span className="font-semibold ml-1 text-white">{battle.winner}</span>
              </div>
              <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10">
                View Breakdown
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default function ArenaPage() {
  const [activeTab, setActiveTab] = useState('active')

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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Battle Arena</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Compete in epic rap battles, earn flames, and climb the leaderboard. 
            Each battle runs for 6 days from creation - create new challenges or accept existing ones.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="flame" className="px-8">
              <Plus className="w-4 h-4 mr-2" />
              Create Battle
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 px-8">
              <Headphones className="w-4 h-4 mr-2" />
              Upload Beat
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">1,247</div>
            <div className="text-gray-400">Active Battles</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">5,892</div>
            <div className="text-gray-400">Total Rappers</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">892</div>
            <div className="text-gray-400">Battles Won</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">2.4M</div>
            <div className="text-gray-400">Flames Earned</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
              <TabsTrigger className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500" value="active">
                Active Battles
              </TabsTrigger>
              <TabsTrigger className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500" value="open">
                Open Challenges
              </TabsTrigger>
              <TabsTrigger className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500" value="finished">
                Finished
              </TabsTrigger>
            </TabsList>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Battles run for 6 days
            </div>
          </div>

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
  )
}

'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame, Music, Crown, Users, Trophy, Play, Pause } from 'lucide-react'

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

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flame className="w-12 h-12 text-orange-500" />
            <h1 className="text-6xl font-bold text-white">Flame Battles</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Compete in epic hip-hop battles, earn flames, and customize your profile with exclusive avatars and beats.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="flame" className="px-8">
              <Flame className="w-4 h-4 mr-2" />
              View Sample Battle
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 px-8">
              Browse Store
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Music className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Epic Battles</h3>
            <p className="text-gray-400">Compete in intense rap battles with other artists</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Flame className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Earn Flames</h3>
            <p className="text-gray-400">Win battles to earn flames and climb the ranks</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Custom Avatars</h3>
            <p className="text-gray-400">Purchase and equip unique profile avatars</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center p-6 rounded-lg bg-black/20 backdrop-blur-md border border-white/10"
          >
            <Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Exclusive Beats</h3>
            <p className="text-gray-400">Buy premium beats for your battle entries</p>
          </motion.div>
        </div>

        {/* Battle Card Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-black/20 backdrop-blur-md border-white/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                  N
                </div>
                <span className="text-sm font-semibold text-white">Nova</span>
                <span className="text-xs text-gray-400">vs</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  K
                </div>
                <span className="text-sm font-semibold text-white">Kairo</span>
                <div className="ml-2 px-2 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-gray-300">
                  92 BPM
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Trophy className="w-3.5 h-3.5" /> 5d 11h left
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Challenger */}
                <div className="rounded-xl border border-white/10 p-3 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                        N
                      </div>
                      <span className="text-sm font-medium text-white">Nova</span>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  {wave}
                </div>
                {/* Opponent */}
                <div className="rounded-xl border border-white/10 p-3 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        K
                      </div>
                      <span className="text-sm font-medium text-white">Kairo</span>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  {wave}
                </div>
              </div>

              {/* Vote meter */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Nova: 1,240 flames</span>
                  <span>Kairo: 1,120 flames</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                </div>
              </div>
            </CardContent>
            <div className="px-5 pb-5">
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
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

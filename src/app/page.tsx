'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Flame, 
  Music, 
  Crown, 
  Users, 
  Trophy, 
  Mic,
  Headphones,
  TrendingUp,
  Instagram,
  Play
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Flame className="w-12 h-12 text-white" />
            </div>
                               <h1 className="text-6xl font-bold text-white">Flaame</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate hip-hop battle platform where rappers compete, earn flames, 
            and climb the leaderboard. Create epic battles, showcase your skills, and become legendary.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/arena">
              <Button size="lg" variant="flame" className="px-8">
                <Mic className="w-4 h-4 mr-2" />
                Enter Arena
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 px-8">
                <Instagram className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
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
            <Mic className="w-12 h-12 text-blue-500 mx-auto mb-4" />
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

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link href="/arena">
            <Card className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Battle Arena
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">View active battles, create challenges, and compete with other rappers.</p>
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <Play className="w-4 h-4 mr-2" />
                  Enter Arena
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leaderboard">
            <Card className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">See the top rappers, track your ranking, and compete for legendary status.</p>
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Rankings
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/store/avatars">
            <Card className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Avatar Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">Browse and purchase unique avatars to customize your profile.</p>
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <Headphones className="w-4 h-4 mr-2" />
                  Browse Store
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Demo Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/demo">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              View Demo
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

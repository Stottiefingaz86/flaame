'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Play,
  Star,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  User
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
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src="/flaame_logo.png"
              alt="Flaame"
              className="h-20"
            />
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate hip-hop battle platform where rappers compete, earn flames, 
            and climb the leaderboard. Create epic battles, showcase your skills, and become legendary.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/arena">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8">
                Enter Arena
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 px-8">
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

        {/* Featured Battle Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-400" />
              Featured Battle
            </h2>
            <Link href="/arena">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View All Battles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      Active Battle
                    </Badge>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Street Dreams vs Concrete Reality</h3>
                  <p className="text-gray-300 mb-6">
                    Two rising stars clash in an epic battle over the beat &quot;Street Dreams&quot; by Stottie Fingaz. 
                    Watch as they trade bars about ambition, struggle, and the pursuit of success.
                  </p>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">MC</span>
                      </div>
                      <span className="text-white font-semibold">MC_Flaame</span>
                    </div>
                    <span className="text-gray-400">vs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">RB</span>
                      </div>
                      <span className="text-white font-semibold">RapBeast</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Link href="/arena">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Battle
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Vote Now
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Music className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <p className="text-white font-semibold">Street Dreams</p>
                      <p className="text-gray-400 text-sm">by Stottie Fingaz</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Artist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Star className="w-8 h-8 text-orange-400" />
              Featured Artist
            </h2>
            <Link href="/blog/artist-spotlight-fletchy">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Read Full Story
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      Artist Spotlight
                    </Badge>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                      Newcastle, UK
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Fletchy</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    North East rapper Fletchy brings authentic hip-hop that speaks to the essence of what the genre 
                    has always been: escapism and the power of words. His latest album &quot;Shangri-La&quot; is a love letter 
                    to hip-hop, featuring production from Stottie Fingaz.
                  </p>
                  
                  <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
                    <p className="text-orange-400 font-semibold italic">
                      &quot;When I put my pen to the pad I&apos;m subconsciously escaping, nothing else matters at that moment in time, it&apos;s pure bliss.&quot;
                    </p>
                    <cite className="text-gray-400 text-sm">— Fletchy</cite>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <a 
                      href="https://open.spotify.com/artist/4vShBjt1fl5s35OJg22knZ?si=8HvAJalERmy7TmCU9ucbrw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Listen on Spotify
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link href="/blog/artist-spotlight-fletchy">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Read Full Story
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-white font-semibold">84 Monthly Listeners</p>
                      <p className="text-gray-400 text-sm">169 Followers</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blog Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Music className="w-8 h-8 text-orange-400" />
              Latest from the Blog
            </h2>
            <Link href="/blog">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View All Posts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog/how-to-download-beats-tutorial">
              <Card className="group bg-black/20 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      Tutorial
                    </Badge>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                      Featured
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-orange-400 transition-colors">
                    How to Download Beats and Record Your Flaame: Complete Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    Learn how to download beats from our platform, set up your recording software, and create your first battle-ready track.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Flaame Team
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Jan 15, 2024
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        8 min read
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/blog/artist-spotlight-fletchy">
              <Card className="group bg-black/20 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      Artist Spotlight
                    </Badge>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                      Featured
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-orange-400 transition-colors">
                    Artist Spotlight: Fletchy - The North East Rapper Keeping It Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    Discover the authentic hip-hop artistry of Fletchy from Newcastle, whose music speaks to the essence of what hip-hop has always been.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Flaame Team
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Jan 10, 2024
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        6 min read
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <Link href="/arena">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Battle Arena</h3>
                    <p className="text-orange-400 text-sm">Compete & Create</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">View active battles, create challenges, and compete with other rappers in epic rap battles.</p>
                <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
                  <span className="font-medium">Enter Arena</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/leaderboard">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Leaderboard</h3>
                    <p className="text-blue-400 text-sm">Rankings & Stats</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">See the top rappers, track your ranking, and compete for legendary status.</p>
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium">View Rankings</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/store/avatars">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Avatar Store</h3>
                    <p className="text-green-400 text-sm">Customize & Shop</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">Browse and purchase unique avatars to customize your profile and stand out.</p>
                <div className="flex items-center text-green-400 group-hover:text-green-300 transition-colors">
                  <span className="font-medium">Browse Store</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
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

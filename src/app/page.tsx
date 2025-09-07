'use client'

// Force deployment - trigger new build
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Music, 
  Users, 
  Trophy, 
  Mic,
  Play,
  Star,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  User,
  Download,
  Swords,
  UserCheck,
  Vote
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import FeaturedProducer from '@/components/home/FeaturedProducer'

export default function HomePage() {
  const { user } = useUser()

  return (
    <div className="w-full flex justify-center">
      {/* Hero Section */}
      <div className="w-full max-w-4xl px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-130px)] md:min-h-[calc(100vh-80px)]">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plug in that microphone.
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Rappers battle. Producers drop beats. Fans decide.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/arena">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8">
                <Mic className="w-5 h-5 mr-2" />
                Enter Arena
              </Button>
            </Link>
            {!user && (
              <Link href="/auth">
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 px-8">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Giveaway Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 w-full"
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1 text-sm md:text-base">🎉 Giveaway Alert!</h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    First 50 Winners will get put into a draw to Win $100 Amazon Voucher.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Battle Creation Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16 w-full"
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 h-full flex flex-col w-full">
            <CardContent className="p-8 flex-1 flex flex-col w-full">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Ready to Battle?</h2>
              <div className="relative">
                {/* Desktop: Horizontal stepper with connecting lines */}
                <div className="hidden md:flex items-center justify-between">
                  {/* Step 1: Download Beat */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium text-sm mb-1">1. Download Beat</div>
                    <Link href="/beats" className="text-orange-400 hover:text-orange-300 text-xs underline">
                      Go to Beats
                    </Link>
                  </div>

                  {/* Connecting line 1 */}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500/50 to-blue-500/50 mx-4"></div>

                  {/* Step 2: Record Battle */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-3">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium text-sm mb-1">2. Record Battle</div>
                    <div className="text-gray-400 text-xs">Record your verse</div>
                  </div>

                  {/* Connecting line 2 */}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500/50 to-green-500/50 mx-4"></div>

                  {/* Step 3: Create Battle */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-3">
                      <Swords className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium text-sm mb-1">3. Create Battle</div>
                    <div className="text-gray-400 text-xs">Upload & challenge</div>
                  </div>

                  {/* Connecting line 3 */}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500/50 to-yellow-500/50 mx-4"></div>

                  {/* Step 4: Wait for Challenger */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-3">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium text-sm mb-1">4. Wait for Challenger</div>
                    <div className="text-gray-400 text-xs">Someone joins battle</div>
                  </div>

                  {/* Connecting line 4 */}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-yellow-500/50 to-purple-500/50 mx-4"></div>

                  {/* Step 5: Users Vote */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                      <Vote className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium text-sm mb-1">5. Users Vote</div>
                    <div className="text-gray-400 text-xs">Fans decide winner</div>
                  </div>
                </div>

                {/* Mobile: Vertical stepper */}
                <div className="md:hidden space-y-6">
                  {/* Step 1: Download Beat */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">1. Download Beat</div>
                      <Link href="/beats" className="text-orange-400 hover:text-orange-300 text-xs underline">
                        Go to Beats
                      </Link>
                    </div>
                  </div>

                  {/* Step 2: Record Battle */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">2. Record Battle</div>
                      <div className="text-gray-400 text-xs">Record your verse</div>
                    </div>
                  </div>

                  {/* Step 3: Create Battle */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Swords className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">3. Create Battle</div>
                      <div className="text-gray-400 text-xs">Upload & challenge</div>
                    </div>
                  </div>

                  {/* Step 4: Wait for Challenger */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">4. Wait for Challenger</div>
                      <div className="text-gray-400 text-xs">Someone joins battle</div>
                    </div>
                  </div>

                  {/* Step 5: Users Vote */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Vote className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">5. Users Vote</div>
                      <div className="text-gray-400 text-xs">Fans decide winner</div>
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
          className="mb-16 w-full"
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 h-full flex flex-col w-full">
            <CardContent className="p-8 flex-1 flex flex-col w-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Star className="w-8 h-8 text-yellow-400" />
                  Featured Artist
                </h2>
                <Link href="/blog/artist-spotlight-fletchy">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Read Full Story
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  Artist Spotlight
                </Badge>
                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                  Newcastle, UK
                </Badge>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Fletchy</h3>
              <p className="text-gray-300 mb-6">
                North East rapper Fletchy brings authentic hip-hop that speaks to the essence of what the genre 
                has always been: escapism and the power of words. His latest album "Shangri-La" is a love letter 
                to hip-hop, featuring production from Stottie Fingaz.
              </p>
              
              <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
                <p className="text-orange-400 font-semibold italic">
                  "When I put my pen to the pad I'm subconsciously escaping, nothing else matters at that moment in time, it's pure bliss."
                </p>
                <cite className="text-gray-400 text-sm">— Fletchy</cite>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Music className="w-5 h-5" />
                  <span>84 Monthly Listeners</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-5 h-5" />
                  <span>169 Followers</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-auto">
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Producer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16 w-full"
        >
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 h-full flex flex-col w-full">
            <CardContent className="p-8 flex-1 flex flex-col w-full">
              <FeaturedProducer />
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
                        Jan 15, 2025
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
                        Jan 10, 2025
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

      </div>
    </div>
  )
}

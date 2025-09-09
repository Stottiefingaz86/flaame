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
import FeaturedArtist from '@/components/home/FeaturedArtist'
import BattleStepper from '@/components/home/BattleStepper'

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
              src="/head.svg"
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
          <div className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full rounded-lg">
            <div className="p-8 flex-1 flex flex-col w-full">
              <BattleStepper />
            </div>
          </div>
        </motion.div>

        {/* Featured Artist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-16 w-full"
        >
          <div className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full rounded-lg">
            <div className="p-8 flex-1 flex flex-col w-full">
              <FeaturedArtist />
            </div>
          </div>
        </motion.div>

        {/* Featured Producer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16 w-full"
        >
          <div className="bg-transparent backdrop-blur-xl border border-white/10 h-full flex flex-col w-full rounded-lg">
            <div className="p-8 flex-1 flex flex-col w-full">
              <FeaturedProducer />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

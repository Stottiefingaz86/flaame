'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Instagram, 
  Flame, 
  Mic, 
  Crown, 
  Users, 
  Music, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleInstagramLogin = async () => {
    setIsLoading(true)
    try {
      // Redirect to Instagram OAuth
      window.location.href = '/api/auth/instagram'
    } catch (error) {
      console.error('Instagram login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Flame className="w-12 h-12 text-white" />
              </div>
                             <h1 className="text-5xl font-bold text-white">Join Flaame</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with Instagram to start battling, earning flames, and climbing the leaderboard. 
              Your Instagram profile becomes your battle identity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader className="text-center">
                                     <CardTitle className="text-white text-2xl">Sign In with Instagram</CardTitle>
                   <p className="text-gray-400">The only way to join Flaame</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      onClick={handleInstagramLogin}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Instagram className="w-6 h-6" />
                          Continue with Instagram
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      By continuing, you agree to our{' '}
                      <a href="#" className="text-orange-400 hover:text-orange-300">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-orange-400 hover:text-orange-300">Privacy Policy</a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6">Why Instagram Login?</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-purple-500/20">
                      <Instagram className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Verified Identity</h3>
                      <p className="text-gray-400 text-sm">Your Instagram profile ensures authentic users and reduces fake accounts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-orange-500/20">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Social Integration</h3>
                      <p className="text-gray-400 text-sm">Connect with your existing Instagram followers and build your battle community.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Secure & Private</h3>
                      <p className="text-gray-400 text-sm">We only access your public profile information. Your private data stays private.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <Zap className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Instant Setup</h3>
                      <p className="text-gray-400 text-sm">No email verification or password creation needed. Start battling immediately.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You Get */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">What You Get</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mic className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">Create and join battles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">Earn and spend flames</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Crown className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">Climb the leaderboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Music className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">Access to beat store</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">Join the community chat</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-400 text-sm mb-4">
                If you're having trouble signing in with Instagram, make sure your Instagram account is public 
                and you're logged into Instagram in your browser.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <a href="#" className="text-orange-400 hover:text-orange-300">Help Center</a>
                <a href="#" className="text-orange-400 hover:text-orange-300">Contact Support</a>
                <a href="#" className="text-orange-400 hover:text-orange-300">Privacy Policy</a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

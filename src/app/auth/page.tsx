'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Instagram, 
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto text-center"
        >
          {/* New Stylized Logo */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-white tracking-wide" style={{
                fontFamily: 'Brush Script MT, cursive',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                transform: 'rotate(-2deg)',
                position: 'relative'
              }}>
                Flaame
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-full" style={{
                  transform: 'rotate(2deg)',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}></div>
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Join the battle. Connect with Instagram to start.
            </p>
          </div>

          {/* Instagram Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Button
              onClick={handleInstagramLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-5 text-lg font-semibold rounded-xl shadow-lg"
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
          </motion.div>

          {/* Simple Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3 mb-6"
          >
            <div className="text-sm text-gray-400 space-y-2">
              <div>✓ Verified identity with Instagram</div>
              <div>✓ Instant setup, no passwords</div>
              <div>✓ Connect with your followers</div>
            </div>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-xs text-gray-500"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-orange-400 hover:text-orange-300">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-orange-400 hover:text-orange-300">Privacy Policy</a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

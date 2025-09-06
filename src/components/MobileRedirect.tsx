'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone } from 'lucide-react'

interface MobileRedirectProps {
  children: React.ReactNode
}

export default function MobileRedirect({ children }: MobileRedirectProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isSmallScreen = window.innerWidth < 1024 // Less than desktop breakpoint
      
      setIsMobile(isMobileDevice || isSmallScreen)
      setIsLoading(false)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-black to-orange-900">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isMobile) {
    return <>{children}</> // Show normal content on desktop
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto text-center"
      >
        {/* Logo */}
        <div className="mb-12">
          <img
            src="/flaame_logo.png"
            alt="Flaame"
            className="h-24 mx-auto mb-8"
          />
        </div>

        {/* Main Message Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Desktop Experience Required</h1>
          </div>
          
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            Flaame is designed for the full desktop experience with advanced audio features and interactive elements.
          </p>
          
          <div className="flex items-center justify-center gap-3 text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <Smartphone className="w-5 h-5" />
            <span className="font-medium">Mobile app coming soon</span>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-white text-sm font-bold">🎤</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Battle System</h3>
            <p className="text-gray-400 text-sm">Full audio playback and voting</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-white text-sm font-bold">🏆</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Leaderboards</h3>
            <p className="text-gray-400 text-sm">Track your progress</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-white text-sm font-bold">🎵</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Beat Marketplace</h3>
            <p className="text-gray-400 text-sm">Discover and purchase beats</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-white text-sm font-bold">💬</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-400 text-sm">Connect with the community</p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4"
        >
          <p className="text-gray-400 text-sm mb-6">
            Switch to desktop to experience the full Flaame platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.flaame.co"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
            >
              Visit on Desktop
            </a>
            <button
              onClick={() => window.location.reload()}
              className="border border-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Try Anyway
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

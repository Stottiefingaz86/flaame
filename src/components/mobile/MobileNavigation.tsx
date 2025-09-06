'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Home,
  Mic,
  Music,
  Crown as CrownIcon,
  Trophy,
  MessageCircle,
  X,
  User,
  LogOut
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'
import ChatPanel from '@/components/chat/ChatPanel'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/arena', label: 'Arena', icon: Mic },
  { href: '/beats', label: 'Beats', icon: Music },
  { href: '/leaderboard', label: 'Leaderboard', icon: CrownIcon },
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false)
    }
  }

  // Add event listener for clicking outside
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/30 border-b border-white/20 md:hidden mobile-header">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/flaame_logo.png"
              alt="Flaame"
              className="h-10"
            />
          </Link>

          {/* Right Side - Auth or User + Chat */}
          <div className="flex items-center gap-2">
            {user ? (
              /* User Avatar and Chat Button for logged in users */
              <div className="flex items-center gap-2">
                {/* User Avatar with Dropdown */}
                <div className="relative z-[99999]" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-8 h-8 rounded-full border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-0 overflow-hidden flex items-center justify-center"
                  >
                    {user.avatar_id ? (
                      <img
                        src={`/api/avatars/${encodeURIComponent(user.avatar_id)}`}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        {typeof window !== 'undefined' && createPortal(
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="fixed top-16 right-4 w-48 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-[99999]"
                          >
                            <div className="py-2">
                              <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <User className="w-4 h-4" />
                                View Profile
                              </Link>
                              <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors w-full text-left"
                              >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                              </button>
                            </div>
                          </motion.div>,
                          document.body
                        )}
                      </>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Chat Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(true)}
                  className="text-white hover:bg-white/10"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </div>
            ) : (
              /* Auth buttons for logged out users */
              <div className="flex items-center gap-2">
                <Link href="/auth?mode=signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 text-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm px-4"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Swipeable Navigation Tabs */}
        <div className="px-4 pb-2 pt-2">
          <div 
            ref={scrollContainerRef}
            className="flex justify-between overflow-x-auto scrollbar-hide relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <div className={`relative px-2 py-2 whitespace-nowrap flex items-center justify-center ${
                    isActive(item.href)
                      ? "text-orange-400"
                      : "text-gray-300 hover:text-white"
                  }`}>
                    <Icon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                    {isActive(item.href) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                      />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Mobile Chat Drawer */}
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsChatOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm h-full bg-black/95 backdrop-blur-xl border-l border-white/10 ml-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Chat</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-white/20 border border-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Chat Content */}
            <div className="h-[calc(100vh-80px)]">
              <ChatPanel isOpen={true} onToggle={() => setIsChatOpen(false)} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

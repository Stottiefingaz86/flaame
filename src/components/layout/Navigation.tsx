'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Flame,
  Mic,
  Crown,
  Music,
  Home,
  Menu,
  X,
  Wallet,
  LogOut,
  User,
  Settings,
  Sword,
  BookOpen,
  MessageCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useChat } from '@/contexts/ChatContext'
import StyledUsername from '@/components/ui/StyledUsername'

interface User {
  id: string
  username: string
  instagram_username: string
  flames: number
  avatar_id?: string
  is_verified: boolean
  rank: string
}

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoading } = useUser()
  const { isChatOpen, toggleChat } = useChat()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/arena', label: 'Arena', icon: Mic },
    { href: '/beats', label: 'Beats', icon: Music },
    { href: '/leaderboard', label: 'Leaderboard', icon: Crown },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }



  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }


  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legendary': return 'text-yellow-400'
      case 'Veteran': return 'text-blue-400'
      case 'Rising': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-between w-full max-w-7xl mx-auto px-4 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center px-2">
          <img
            src="/flaame_logo.png"
            alt="Flaame"
            className="h-10"
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  } rounded-xl px-4 py-2`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>

                     {/* Right Side */}
             <div className="flex items-center gap-3 transition-all duration-300" style={{ marginRight: 'var(--chat-width, 400px)' }}>
               {!isLoading && (
                 <>
                   {user ? (
                     <>
                       {/* Wallet - Clickable to go to store */}
                       <Link href="/store">
                         <Button 
                           variant="ghost" 
                           className="flex items-center gap-2 px-3 py-2 rounded-xl bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200"
                         >
                           <Flame className="w-4 h-4 text-orange-500" />
                           <span className="text-white font-semibold">{user.flames.toLocaleString()}</span>
                         </Button>
                       </Link>

                       {/* User Menu and Chat Toggle */}
                       <div className="flex items-center gap-2">
                         <div className="relative group">
                           <Button 
                             variant="ghost" 
                             className="p-1 rounded-full border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-200"
                           >
                             <Avatar className="h-8 w-8">
                               <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                               <AvatarFallback className="bg-white/10 text-white">
                                 {user.username.charAt(0).toUpperCase()}
                               </AvatarFallback>
                             </Avatar>
                           </Button>

                           {/* Dropdown Menu */}
                           <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                           <div className="p-4 border-b border-white/10">
                             <div className="flex items-center gap-3">
                               <Avatar className="h-10 w-10">
                                 <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                                 <AvatarFallback className="bg-white/10 text-white">
                                   {user.username.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <div className="flex items-center gap-2">
                                   <StyledUsername 
                  username={user.username} 
                  userId={user.id}
                  className="text-white font-semibold"
                />
                                   {user.is_verified && (
                                     <span className="text-yellow-400 text-sm">👑</span>
                                   )}
                                 </div>
                                 <div className="flex items-center gap-2 text-sm">
                                   <span className={`${getRankColor(user.rank)}`}>{user.rank}</span>
                                   <span className="text-gray-400">•</span>
                                   <span className="text-gray-400">@{user.instagram_username}</span>
                                 </div>
                               </div>
                             </div>
                           </div>

                           <div className="p-2">
                             <Link href="/profile">
                               <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                                 <User className="w-4 h-4 mr-2" />
                                 Profile
                               </Button>
                             </Link>
                             <Button
                               variant="ghost"
                               className="w-full justify-start text-red-400 hover:bg-red-500/10"
                               onClick={handleSignOut}
                             >
                               <LogOut className="w-4 h-4 mr-2" />
                               Sign Out
                             </Button>
                           </div>
                           </div>
                         </div>

                         {/* Chat Toggle Button */}
                         <Button 
                           onClick={toggleChat}
                           variant="ghost" 
                           className="p-1 rounded-full border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-200"
                           size="icon"
                         >
                           <MessageCircle className="w-4 h-4 text-white" />
                         </Button>
                       </div>
                     </>
                   ) : (
                     <div className="flex items-center gap-2">
                       <Link href="/auth?mode=signin">
                         <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                           Sign In
                         </Button>
                       </Link>
                       <Link href="/auth?mode=signup">
                         <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                           Create Account
                         </Button>
                       </Link>
                     </div>
                   )}
                 </>
               )}
             </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden w-full px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/flaame_logo.png"
              alt="Flaame"
              className="h-10"
            />
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4"
          >
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      } w-full justify-start rounded-xl px-4 py-3`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Wallet & Auth */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <Link href="/store">
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/20 border border-white/10 hover:bg-black/30 transition-all duration-200 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-white font-semibold">{user.flames.toLocaleString()} Flames</span>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                          <AvatarFallback className="bg-white/10 text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <StyledUsername 
                  username={user.username} 
                  userId={user.id}
                  className="text-white font-semibold"
                />
                          <div className={`text-xs ${getRankColor(user.rank)}`}>{user.rank}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth?mode=signin">
                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth?mode=signup">
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </>
  )
}

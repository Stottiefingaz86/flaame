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
  ShoppingCart
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/arena', label: 'Arena', icon: Mic },
    { href: '/beats', label: 'Beats', icon: Music },
    { href: '/leaderboard', label: 'Leaderboard', icon: Crown },
    { href: '/store', label: 'Store', icon: ShoppingCart },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser(profile)
          }
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
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
      <nav className="hidden lg:flex items-center justify-between w-full max-w-7xl mx-auto px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
            <Flame className="w-6 h-6 text-white" />
          </div>
                           <span className="text-xl font-bold text-white">Flaame</span>
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
             <div className="flex items-center gap-3 transition-all duration-300" style={{ marginRight: 'var(--chat-width, 320px)' }}>
               {!isLoading && (
                 <>
                   {user ? (
                     <>
                       {/* Wallet - Clickable to go to store */}
                       <Link href="/store">
                         <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 transition-all duration-200 cursor-pointer">
                           <Flame className="w-4 h-4 text-orange-500" />
                           <span className="text-white font-semibold">{user.flames.toLocaleString()}</span>
                         </div>
                       </Link>

                       {/* User Menu */}
                       <div className="relative group">
                         <Button variant="ghost" className="p-1 rounded-full">
                           <Avatar className="h-8 w-8">
                             <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                             <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                               {user.username.charAt(0).toUpperCase()}
                             </AvatarFallback>
                           </Avatar>
                         </Button>

                         {/* Dropdown Menu */}
                         <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                           <div className="p-4 border-b border-white/10">
                             <div className="flex items-center gap-3">
                               <Avatar className="h-10 w-10">
                                 <AvatarImage src={user.avatar_id ? `/api/avatars/${user.avatar_id}` : undefined} />
                                 <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                   {user.username.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-white font-semibold">{user.username}</span>
                                   {user.is_verified && (
                                     <span className="text-blue-400 text-xs">✓</span>
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
                             <Link href="/settings">
                               <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                                 <Settings className="w-4 h-4 mr-2" />
                                 Settings
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
                     </>
                   ) : (
                     <Link href="/auth">
                       <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                         Sign In
                       </Button>
                     </Link>
                   )}
                 </>
               )}
             </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Flame className="w-5 h-5 text-white" />
            </div>
                               <span className="text-lg font-bold text-white">Flaame</span>
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
                          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-white font-semibold">{user.username}</div>
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
                    <Link href="/auth">
                      <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">
                        Sign In
                      </Button>
                    </Link>
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

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface User {
  id: string
  username: string
  flames: number
  rank: string
  avatar_id?: string
  is_verified: boolean
  instagram_username?: string
  preferred_league_id?: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
              flames: 5,
              rank: 'Newcomer',
              is_verified: false
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating profile:', createError)
            setUser(null)
          } else {
            setUser(newProfile)
          }
        } else if (profile) {
          // Check for daily login reward
          await checkDailyLoginReward(profile)
          setUser(profile)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const checkDailyLoginReward = async (profile: any) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const lastLogin = profile.last_login_date
      
      // If user hasn't logged in today, give them a reward
      if (!lastLogin || lastLogin !== today) {
        const { data, error } = await supabase.rpc('handle_daily_login_reward', {
          user_id: profile.id
        })
        
        if (!error && data > 0) {
          // Update local user state with new flames
          setUser(prev => prev ? { ...prev, flames: (prev.flames || 0) + data } : null)
          console.log(`Daily login reward: +${data} flames!`)
        }
      }
    } catch (error) {
      console.error('Error checking daily login reward:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timed out, setting loading to false')
            setIsLoading(false)
          }
        }, 5000) // 5 second timeout
        
        await refreshUser()
        
        // Clear timeout if successful
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.id)
        
        try {
          if (event === 'INITIAL_SESSION' && session?.user) {
            // This is the initial session, we need to load the user profile
            console.log('Initial session detected, loading user profile...')
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (error) {
              console.error('Error fetching profile:', error)
              setUser(null)
            } else if (profile) {
              console.log('Profile loaded from initial session:', profile.username)
              setUser(profile)
            }
          } else if (session?.user) {
            // Get user profile data
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (error) {
              console.error('Error fetching profile:', error)
              setUser(null)
            } else if (profile) {
              console.log('Profile loaded from auth change:', profile.username)
              setUser(profile)
            }
          } else {
            console.log('No session, setting user to null')
            setUser(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: UserContextType = {
    user,
    isLoading,
    refreshUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

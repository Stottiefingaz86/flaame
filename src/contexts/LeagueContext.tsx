'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface League {
  id: string
  name: string
  country: string
  language: string
  flag_emoji: string
  is_active: boolean
}

interface LeagueContextType {
  currentLeague: League | null
  leagues: League[]
  isLoading: boolean
  setCurrentLeague: (league: League) => void
  loadLeagues: () => Promise<void>
  updateUserPreferredLeague: (leagueId: string) => Promise<void>
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined)

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [currentLeague, setCurrentLeagueState] = useState<League | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      setLeagues(data || [])
      
      // Set default league if none is selected
      if (!currentLeague && data && data.length > 0) {
        const defaultLeague = data.find(league => league.name === 'US/UK League') || data[0]
        setCurrentLeagueState(defaultLeague)
      }
    } catch (error) {
      console.error('Error loading leagues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setCurrentLeague = (league: League) => {
    setCurrentLeagueState(league)
    // Save to localStorage for persistence
    localStorage.setItem('currentLeague', JSON.stringify(league))
  }

  const updateUserPreferredLeague = async (leagueId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_league_id: leagueId })
        .eq('id', (await supabase.auth.getUser()).data.user?.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating preferred league:', error)
    }
  }

  useEffect(() => {
    loadLeagues()
    
    // Load saved league from localStorage
    const savedLeague = localStorage.getItem('currentLeague')
    if (savedLeague) {
      try {
        const league = JSON.parse(savedLeague)
        setCurrentLeagueState(league)
      } catch (error) {
        console.error('Error parsing saved league:', error)
      }
    }
  }, [])

  const value: LeagueContextType = {
    currentLeague,
    leagues,
    isLoading,
    setCurrentLeague,
    loadLeagues,
    updateUserPreferredLeague
  }

  return (
    <LeagueContext.Provider value={value}>
      {children}
    </LeagueContext.Provider>
  )
}

export function useLeague() {
  const context = useContext(LeagueContext)
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider')
  }
  return context
}


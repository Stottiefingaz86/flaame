import { supabase } from './supabase/client'

export interface Vote {
  id: string
  battle_id: string
  voter_id: string
  voted_for: string
  created_at: string
}

export interface BattleFlame {
  id: string
  battle_id: string
  gifter_id: string
  amount: number
  created_at: string
  gifter?: {
    id: string
    username: string
    avatar_id?: string
  }
}

export interface BattleWithDetails {
  id: string
  title: string
  status: 'pending' | 'challenge' | 'active' | 'closed' | 'cancelled'
  challenger_id: string
  opponent_id?: string
  beat_id: string
  created_at: string
  ends_at: string
  challenger_votes: number
  opponent_votes: number
  winner_id?: string
  completed_at?: string
  challenger_track?: string
  opponent_track?: string
  challenger_lyrics?: string
  opponent_lyrics?: string
  challenger?: {
    id: string
    username: string
    avatar_id?: string
    flames: number
    wins?: number
    losses?: number
    rank?: string
  }
  opponent?: {
    id: string
    username: string
    avatar_id?: string
    flames: number
    wins?: number
    losses?: number
    rank?: string
  }
  beat?: {
    id: string
    title: string
    artist: string
    file_path?: string
  }
  user_voted_for?: string
  total_gifted_flames?: number
}

export class BattleSystem {
  // Vote for a battle
  static async voteForBattle(battleId: string, votedFor: 'challenger' | 'opponent', userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get battle details to determine which user ID to vote for
      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .select('challenger_id, opponent_id, status, ends_at')
        .eq('id', battleId)
        .single()

      if (battleError) throw battleError

      // Check if battle is still active
      if (battle.status !== 'active') {
        return { success: false, error: 'Battle is not yet active for voting' }
      }

      // Check if battle has ended
      if (new Date(battle.ends_at) <= new Date()) {
        return { success: false, error: 'Battle has ended' }
      }

      // Determine the user ID to vote for
      const targetUserId = votedFor === 'challenger' ? battle.challenger_id : battle.opponent_id
      
      if (!targetUserId) {
        return { success: false, error: 'Invalid vote target' }
      }

      // Insert vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          battle_id: battleId,
          voter_id: userId,
          voted_for: targetUserId
        })

      if (voteError) {
        if (voteError.code === '23505') { // Unique constraint violation
          return { success: false, error: 'You have already voted in this battle' }
        }
        throw voteError
      }

      // Update vote counts
      const voteIncrement = votedFor === 'challenger' ? 
        { challenger_votes: battle.challenger_votes + 1 } : 
        { opponent_votes: battle.opponent_votes + 1 }

      const { error: updateError } = await supabase
        .from('battles')
        .update(voteIncrement)
        .eq('id', battleId)

      if (updateError) throw updateError

      return { success: true }
    } catch (error) {
      console.error('Error voting for battle:', error)
      return { success: false, error: 'Failed to vote' }
    }
  }

  // Gift flames to a battle
  static async giftFlames(battleId: string, amount: number, gifterId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user has enough flames
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('flames')
        .eq('id', gifterId)
        .single()

      if (profileError) throw profileError

      if (profile.flames < amount) {
        return { success: false, error: 'Insufficient flames' }
      }

      // Check if battle is still active
      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .select('status, ends_at')
        .eq('id', battleId)
        .single()

      if (battleError) throw battleError

      if (battle.status !== 'active' && battle.status !== 'pending') {
        return { success: false, error: 'Battle is no longer accepting flame gifts' }
      }

      if (new Date(battle.ends_at) <= new Date()) {
        return { success: false, error: 'Battle has ended' }
      }

      // Start transaction
      const { error: giftError } = await supabase
        .from('battle_flames')
        .insert({
          battle_id: battleId,
          gifter_id: gifterId,
          amount: amount
        })

      if (giftError) throw giftError

      // Deduct flames from gifter
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ flames: profile.flames - amount })
        .eq('id', gifterId)

      if (deductError) throw deductError

      return { success: true }
    } catch (error) {
      console.error('Error gifting flames:', error)
      return { success: false, error: 'Failed to gift flames' }
    }
  }

  // Get battle with all details including votes and flames
  static async getBattleWithDetails(battleId: string, userId?: string): Promise<BattleWithDetails | null> {
    try {
      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .select(`
          *,
          challenger:profiles!battles_challenger_id_fkey(id, username, avatar_id, flames),
          opponent:profiles!battles_opponent_id_fkey(id, username, avatar_id, flames),
          beat:beats(id, title, artist, file_path)
        `)
        .eq('id', battleId)
        .single()

      if (battleError) throw battleError

      // Get user's vote if logged in
      let userVote: string | undefined
      if (userId) {
        const { data: vote } = await supabase
          .from('votes')
          .select('id')
          .eq('battle_id', battleId)
          .eq('voter_id', userId)
          .single()

        if (vote) {
          // For now, we'll just mark that the user has voted
          // The actual vote direction isn't stored in the current schema
          // This is a temporary solution until we run the migration
          userVote = 'voted' // Generic indicator that user has voted
        }
      }

      // Get total gifted flames
      const { data: flames } = await supabase
        .from('battle_flames')
        .select('amount')
        .eq('battle_id', battleId)

      const totalGiftedFlames = flames?.reduce((sum, flame) => sum + flame.amount, 0) || 0

      // Calculate battle statistics for challenger and opponent
      const calculateUserStats = async (userId: string) => {
        const { data: userBattles } = await supabase
          .from('battles')
          .select('challenger_id, opponent_id, challenger_votes, opponent_votes, status')
          .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
          .eq('status', 'closed')

        let wins = 0
        let losses = 0

        userBattles?.forEach(battle => {
          const isChallenger = battle.challenger_id === userId
          const userVotes = isChallenger ? battle.challenger_votes : battle.opponent_votes
          const opponentVotes = isChallenger ? battle.opponent_votes : battle.challenger_votes

          if (userVotes > opponentVotes) wins++
          else if (userVotes < opponentVotes) losses++
        })

        return { wins, losses }
      }

      // Calculate stats for challenger and opponent
      const challengerStats = battle.challenger ? await calculateUserStats(battle.challenger.id) : { wins: 0, losses: 0 }
      const opponentStats = battle.opponent ? await calculateUserStats(battle.opponent.id) : { wins: 0, losses: 0 }

      return {
        ...battle,
        user_voted_for: userVote,
        total_gifted_flames: totalGiftedFlames,
        challenger: battle.challenger ? {
          ...battle.challenger,
          wins: challengerStats.wins,
          losses: challengerStats.losses,
          rank: battle.challenger.rank || 'Newcomer'
        } : undefined,
        opponent: battle.opponent ? {
          ...battle.opponent,
          wins: opponentStats.wins,
          losses: opponentStats.losses,
          rank: battle.opponent.rank || 'Newcomer'
        } : undefined
      }
    } catch (error) {
      console.error('Error getting battle details:', error)
      return null
    }
  }

  // Get recent flame gifts for a battle
  static async getBattleFlames(battleId: string, limit: number = 10): Promise<BattleFlame[]> {
    try {
      const { data, error } = await supabase
        .from('battle_flames')
        .select(`
          *,
          gifter:profiles!battle_flames_gifter_id_fkey(id, username, avatar_id)
        `)
        .eq('battle_id', battleId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting battle flames:', error)
      return []
    }
  }

  // Manually complete a battle (for testing or admin use)
  static async completeBattle(battleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('complete_battle', { battle_uuid: battleId })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error completing battle:', error)
      return { success: false, error: 'Failed to complete battle' }
    }
  }

  // Check and complete expired battles
  static async checkExpiredBattles(): Promise<{ success: boolean; completed: number }> {
    try {
      const { error } = await supabase.rpc('check_expired_battles')
      
      if (error) throw error
      
      // Count how many battles were completed
      const { data: completedBattles } = await supabase
        .from('battles')
        .select('id')
        .eq('status', 'closed')
        .gte('completed_at', new Date(Date.now() - 60000).toISOString()) // Last minute

      return { success: true, completed: completedBattles?.length || 0 }
    } catch (error) {
      console.error('Error checking expired battles:', error)
      return { success: false, completed: 0 }
    }
  }

  // Calculate time left for a battle
  static calculateTimeLeft(endDate: string): string {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }
}

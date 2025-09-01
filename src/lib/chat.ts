import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  user_id: string
  message?: string
  emoji_id?: string
  message_type: 'message' | 'battle_challenge' | 'system' | 'emoji'
  battle_id?: string
  created_at: string
  user?: {
    username: string
    avatar_id?: string
    is_verified: boolean
    rank: string
    flames: number
  }
  emoji?: {
    emoji: string
    name: string
    cost: number
  }
}

export interface BattleChallenge {
  id: string
  challenger_id: string
  opponent_id: string
  beat_id?: string
  stakes: number
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  challenger?: {
    username: string
    avatar_id?: string
    is_verified: boolean
    rank: string
  }
  opponent?: {
    username: string
    avatar_id?: string
    is_verified: boolean
    rank: string
  }
  beat?: {
    title: string
    artist: string
  }
}

export class ChatService {
  private supabase = createClient()
  private channel: RealtimeChannel | null = null

  // Subscribe to chat messages
  subscribeToChat(callback: (message: ChatMessage) => void) {
    this.channel = this.supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          // Fetch the full message with user and emoji data
          const { data: fullMessage, error } = await this.supabase
            .from('chat_messages')
            .select(`
              *,
              user:profiles(username, avatar_id, is_verified, rank, flames),
              emoji:emojis(emoji, name, cost)
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && fullMessage) {
            callback(fullMessage as ChatMessage)
          }
        }
      )
      .subscribe()

    return this.channel
  }

  // Subscribe to battle challenges
  subscribeToChallenges(callback: (challenge: BattleChallenge) => void) {
    const challengeChannel = this.supabase
      .channel('battle_challenges')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_challenges'
        },
        (payload) => {
          callback(payload.new as BattleChallenge)
        }
      )
      .subscribe()

    return challengeChannel
  }

  // Send a text message
  async sendMessage(message: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message,
        message_type: 'message'
      })
      .select(`
        *,
        user:profiles(username, avatar_id, is_verified, rank, flames),
        emoji:emojis(emoji, name, cost)
      `)
      .single()

    if (error) throw error
    return data
  }

  // Send an emoji
  async sendEmoji(emojiId: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        emoji_id: emojiId,
        message_type: 'emoji'
      })
      .select(`
        *,
        user:profiles(username, avatar_id, is_verified, rank, flames),
        emoji:emojis(emoji, name, cost)
      `)
      .single()

    if (error) throw error
    return data
  }

  // Create a battle challenge
  async createBattleChallenge(opponentId: string, beatId?: string, stakes: number = 0) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('battle_challenges')
      .insert({
        challenger_id: user.id,
        opponent_id: opponentId,
        beat_id: beatId,
        stakes,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get recent messages
  async getRecentMessages(limit: number = 50): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select(`
        *,
        user:profiles(username, avatar_id, is_verified, rank, flames),
        emoji:emojis(emoji, name, cost)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching chat messages:', error)
      return []
    }
    return data.reverse() // Return in chronological order
  }

  // Get pending battle challenges
  async getPendingChallenges(): Promise<BattleChallenge[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase
      .from('battle_challenges')
      .select(`
        *,
        challenger:profiles!battle_challenges_challenger_id_fkey(username, avatar_id, is_verified, rank),
        opponent:profiles!battle_challenges_opponent_id_fkey(username, avatar_id, is_verified, rank),
        beat:beats(title, artist)
      `)
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching battle challenges:', error)
      return []
    }
    return data
  }

  // Accept a battle challenge
  async acceptChallenge(challengeId: string) {
    const { data, error } = await this.supabase
      .from('battle_challenges')
      .update({ status: 'accepted' })
      .eq('id', challengeId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Decline a battle challenge
  async declineChallenge(challengeId: string) {
    const { data, error } = await this.supabase
      .from('battle_challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user's available emojis
  async getUserEmojis() {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase
      .from('user_emojis')
      .select(`
        emoji:emojis(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user emojis:', error)
      return []
    }
    return data.map(item => item.emoji)
  }

  // Purchase an emoji
  async purchaseEmoji(emojiId: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get emoji details
    const { data: emoji, error: emojiError } = await this.supabase
      .from('emojis')
      .select('*')
      .eq('id', emojiId)
      .single()

    if (emojiError) throw emojiError

    // Check if user already owns this emoji
    const { data: existing } = await this.supabase
      .from('user_emojis')
      .select('*')
      .eq('user_id', user.id)
      .eq('emoji_id', emojiId)
      .single()

    if (existing) throw new Error('You already own this emoji')

    // Spend flames
    const { error: spendError } = await this.supabase.rpc('spend_flames', {
      user_uuid: user.id,
      amount: emoji.cost,
      reason: `Purchased emoji: ${emoji.name}`,
      reference_id: emojiId,
      reference_type: 'emoji'
    })

    if (spendError) throw spendError

    // Add emoji to user's collection
    const { data, error } = await this.supabase
      .from('user_emojis')
      .insert({
        user_id: user.id,
        emoji_id: emojiId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Unsubscribe from all channels
  unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}

export const chatService = new ChatService()

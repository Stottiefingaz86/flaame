import { getSupabaseServerClient } from './db'
import { createServerClient } from './supabase'

export async function hasUserVoted(battleId: string, userId: string) {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('battle_id', battleId)
    .eq('voter_id', userId)
    .single()
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking vote status:', error)
    return false
  }
  
  return !!data
}

export async function getVoteResults(battleId: string) {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('votes')
    .select(`
      entry_id,
      weight
    `)
    .eq('battle_id', battleId)
    
  if (error) {
    console.error('Error fetching vote results:', error)
    return {}
  }
  
  const results: Record<string, number> = {}
  data?.forEach(vote => {
    results[vote.entry_id] = (results[vote.entry_id] || 0) + vote.weight
  })
  
  return results
}

export async function grantFlames(userId: string, amount: number, reason: string) {
  const supabase = await getSupabaseServerClient()
  
  // Start a transaction
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('flames_balance')
    .eq('id', userId)
    .single()
    
  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return { success: false, error: profileError }
  }
  
  const newBalance = (profile.flames_balance || 0) + amount
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ flames_balance: newBalance })
    .eq('id', userId)
    
  if (updateError) {
    console.error('Error updating flames balance:', updateError)
    return { success: false, error: updateError }
  }
  
  // Record the transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: amount,
      type: 'EARN',
      description: reason
    })
    
  if (transactionError) {
    console.error('Error recording transaction:', transactionError)
    // Don't fail the whole operation if transaction logging fails
  }
  
  return { success: true, newBalance }
}

export async function spendFlames(userId: string, amount: number, reason: string) {
  const supabase = await getSupabaseServerClient()
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('flames_balance')
    .eq('id', userId)
    .single()
    
  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return { success: false, error: profileError }
  }
  
  const currentBalance = profile.flames_balance || 0
  if (currentBalance < amount) {
    return { success: false, error: { message: 'Insufficient flames balance' } }
  }
  
  const newBalance = currentBalance - amount
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ flames_balance: newBalance })
    .eq('id', userId)
    
  if (updateError) {
    console.error('Error updating flames balance:', updateError)
    return { success: false, error: updateError }
  }
  
  // Record the transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'SPEND',
      description: reason
    })
    
  if (transactionError) {
    console.error('Error recording transaction:', transactionError)
    // Don't fail the whole operation if transaction logging fails
  }
  
  return { success: true, newBalance }
}

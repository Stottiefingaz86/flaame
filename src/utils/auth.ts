import { supabase } from '@/lib/supabase/client'

/**
 * Clear all authentication data and force a complete reset
 */
export async function clearAuthCache() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear all localStorage items related to Supabase
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear sessionStorage
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('sb-')) {
        sessionKeysToRemove.push(key)
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
    })
    
    // Force page reload to reset all state
    window.location.reload()
    
    return true
  } catch (error) {
    console.error('Error clearing auth cache:', error)
    return false
  }
}

/**
 * Force sign out and redirect to home
 */
export async function forceSignOut() {
  try {
    await supabase.auth.signOut()
    // Clear all auth-related storage
    localStorage.clear()
    sessionStorage.clear()
    // Redirect to home
    window.location.href = '/'
  } catch (error) {
    console.error('Error during force sign out:', error)
    // Even if there's an error, try to redirect
    window.location.href = '/'
  }
}

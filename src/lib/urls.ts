/**
 * Centralized URL management for consistent domain handling
 * This prevents redirect issues that can affect SEO and indexing
 */

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.flaame.co'

export const getAuthCallbackUrl = () => `${BASE_URL}/auth/callback`
export const getAuthResetUrl = () => `${BASE_URL}/auth/reset-password`
export const getHomeUrl = () => `${BASE_URL}/`
export const getAuthUrl = () => `${BASE_URL}/auth`

// API callback URLs
export const getInstagramCallbackUrl = () => `${BASE_URL}/api/auth/instagram/callback`
export const getFacebookCallbackUrl = () => `${BASE_URL}/api/auth/facebook/callback`

// Error URLs
export const getAuthErrorUrl = (error: string, reason?: string) => {
  const params = new URLSearchParams({ error })
  if (reason) params.set('reason', reason)
  return `${getAuthUrl()}?${params.toString()}`
}

// Success URLs
export const getAuthSuccessUrl = (username?: string) => {
  const params = new URLSearchParams()
  if (username) params.set('username', username)
  return `${getHomeUrl()}?auth=success${params.toString() ? '&' + params.toString() : ''}`
}

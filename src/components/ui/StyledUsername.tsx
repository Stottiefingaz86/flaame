'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface StyledUsernameProps {
  username: string
  userId: string
  className?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StyledUsername({ username, userId, className = '' }: StyledUsernameProps) {
  const [equippedItems, setEquippedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEquippedItems = async () => {
      try {
        // If we have userId, fetch equipped items directly
        if (userId) {
          const response = await fetch(`/api/profile/equipped-items?userId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            setEquippedItems(data.items || [])
          }
        } else {
          // If no userId, try to find user by username and get their equipped items
          const response = await fetch(`/api/profile/user-by-username?username=${username}`)
          if (response.ok) {
            const data = await response.json()
            if (data.user?.id) {
              const equippedResponse = await fetch(`/api/profile/equipped-items?userId=${data.user.id}`)
              if (equippedResponse.ok) {
                const equippedData = await equippedResponse.json()
                setEquippedItems(equippedData.items || [])
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading equipped items:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadEquippedItems()
    }
  }, [userId, username])

  if (loading) {
    return <span className={className}>{username}</span>
  }

  // Check for equipped items and apply effects
  const hasGoldName = equippedItems.some(item => item.item_id === 'gold-name')
  const hasEmojiBadge = equippedItems.some(item => item.item_id === 'emoji-badge')
  const hasRainbowText = equippedItems.some(item => item.item_id === 'rainbow-text')
  const hasCrownIcon = equippedItems.some(item => item.item_id === 'crown-icon')

  // Build the styled username
  let displayUsername = username
  
  // Add emoji badge if equipped
  if (hasEmojiBadge) {
    displayUsername = `🎤 ${displayUsername}`
  }

  // Add crown icon if equipped
  if (hasCrownIcon) {
    displayUsername = `👑 ${displayUsername}`
  }

  // Apply text effects
  let textClasses = className
  
  if (hasGoldName) {
    textClasses += ' text-yellow-400 font-bold'
  }
  
  if (hasRainbowText) {
    textClasses += ' animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent'
  }

  return (
    <span className={textClasses}>
      {displayUsername}
    </span>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/lib/db'
import { Flame, Check, Crown } from 'lucide-react'

interface AvatarCardProps {
  avatar: Avatar
  userBalance: number
  isOwned: boolean
}

export default function AvatarCard({ avatar, userBalance, isOwned }: AvatarCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setIsPurchasing(true)
    setError(null)

    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'avatar',
          itemId: avatar.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to purchase avatar')
      }

      // Refresh the page to update balance and ownership status
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase avatar')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleEquip = async () => {
    setIsPurchasing(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarId: avatar.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to equip avatar')
      }

      // Refresh the page to update equipped status
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to equip avatar')
    } finally {
      setIsPurchasing(false)
    }
  }

  const canAfford = userBalance >= avatar.cost_flames
  const isEquipped = isOwned

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="bg-black/20 backdrop-blur-md border-white/10 overflow-hidden">
        <CardHeader className="p-4">
          <div className="relative">
            <img
              src={avatar.image_url}
              alt={avatar.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            {isEquipped && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
            )}
            {avatar.cost_flames === 0 && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                FREE
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <CardTitle className="text-white text-lg">{avatar.name}</CardTitle>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="font-semibold">
                {avatar.cost_flames === 0 ? 'Free' : `${avatar.cost_flames} 🔥`}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {!isOwned ? (
              <Button
                onClick={handlePurchase}
                disabled={!canAfford || isPurchasing}
                variant={canAfford ? "flame" : "outline"}
                className="flex-1"
              >
                {isPurchasing ? (
                  'Purchasing...'
                ) : canAfford ? (
                  <>
                    <Flame className="w-4 h-4 mr-2" />
                    Buy for {avatar.cost_flames} 🔥
                  </>
                ) : (
                  'Insufficient Flames'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleEquip}
                disabled={isPurchasing}
                variant={isEquipped ? "outline" : "flame"}
                className="flex-1"
              >
                {isPurchasing ? (
                  'Equipping...'
                ) : isEquipped ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Equipped
                  </>
                ) : (
                  'Equip Avatar'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

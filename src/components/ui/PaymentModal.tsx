'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download, Flame } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  beatTitle: string
  costFlames: number
  userBalance: number
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  beatTitle, 
  costFlames, 
  userBalance 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  const hasEnoughBalance = userBalance >= costFlames

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Download Premium Beat</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Beat Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{beatTitle}</h3>
            <p className="text-gray-400">This is a premium beat</p>
          </div>

          {/* Cost Display */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{costFlames}</span>
              <span className="text-orange-400">Flaames</span>
            </div>
            <p className="text-sm text-orange-300">will be deducted from your balance</p>
          </div>

          {/* User Balance */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Your Balance:</span>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-white font-medium">{userBalance}</span>
              </div>
            </div>
          </div>

          {/* Warning if insufficient balance */}
          {!hasEnoughBalance && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">
                Insufficient balance. You need {costFlames - userBalance} more Flaames.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!hasEnoughBalance || isProcessing}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download ({costFlames} Flaames)
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



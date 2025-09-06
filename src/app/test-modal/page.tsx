'use client'

import { useState } from 'react'
import AcceptBattleModal from '@/components/battle/AcceptBattleModal'

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false)

  const mockBattle = {
    id: 'test-battle-123',
    title: 'Test Battle',
    challenger: {
      username: 'TestUser'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Test Accept Battle Modal</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg"
        >
          Open Modal
        </button>

        <AcceptBattleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          battle={mockBattle}
          onBattleAccepted={() => {
            console.log('Battle accepted!')
            setShowModal(false)
          }}
        />
      </div>
    </div>
  )
}

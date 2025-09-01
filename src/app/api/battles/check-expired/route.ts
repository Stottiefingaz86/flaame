import { NextRequest, NextResponse } from 'next/server'
import { BattleSystem } from '@/lib/battle-system'

export async function POST(request: NextRequest) {
  try {
    // Check for expired battles and complete them
    const result = await BattleSystem.checkExpiredBattles()
    
    return NextResponse.json({
      success: result.success,
      completed: result.completed,
      message: `Completed ${result.completed} expired battles`
    })
  } catch (error) {
    console.error('Error checking expired battles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check expired battles' },
      { status: 500 }
    )
  }
}

// Allow GET requests for manual testing
export async function GET() {
  return POST(new NextRequest('http://localhost/api/battles/check-expired', { method: 'POST' }))
}

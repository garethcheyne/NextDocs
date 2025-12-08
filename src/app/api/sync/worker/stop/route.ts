import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { stopSyncWorker } from '@/lib/sync/worker'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    stopSyncWorker()
    
    return NextResponse.json({ 
      success: true,
      message: 'Sync worker stopped successfully'
    })
  } catch (error) {
    console.error('Error stopping sync worker:', error)
    return NextResponse.json(
      { error: 'Failed to stop sync worker' },
      { status: 500 }
    )
  }
}

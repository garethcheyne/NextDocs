import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { startSyncWorker } from '@/lib/sync/worker'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    startSyncWorker()
    
    return NextResponse.json({ 
      success: true,
      message: 'Sync worker started successfully'
    })
  } catch (error) {
    console.error('Error starting sync worker:', error)
    return NextResponse.json(
      { error: 'Failed to start sync worker' },
      { status: 500 }
    )
  }
}

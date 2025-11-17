import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { syncRepository } from '@/lib/sync/sync-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Trigger sync in background
    syncRepository(id).catch((error) => {
      console.error('Sync failed:', error)
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Sync initiated' 
    })
  } catch (error) {
    console.error('Failed to initiate sync:', error)
    return NextResponse.json(
      { error: 'Failed to initiate sync' },
      { status: 500 }
    )
  }
}

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

    // Extract IP address (check proxy headers first)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'

    console.log(`🌐 Sync request from IP: ${ip} (User: ${session.user.email})`)

    // Trigger sync in background
    syncRepository(id, ip).catch((error) => {
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

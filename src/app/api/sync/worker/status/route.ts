import { NextRequest, NextResponse } from 'next/server'
import { getWorkerStatus } from '@/lib/sync/worker'
import { auth } from '@/lib/auth/auth'

export async function GET(request: NextRequest) {
  // Require authentication and admin role
  const session = await auth()
  if (!session || session.user?.role?.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = getWorkerStatus()
  
  return NextResponse.json({
    success: true,
    ...status,
  })
}

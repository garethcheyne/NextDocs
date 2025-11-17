import { NextRequest, NextResponse } from 'next/server'
import { startSyncWorker } from '@/lib/sync/worker'

// This endpoint is called on app startup to initialize the worker
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.WORKER_SECRET || 'change-me-in-production'
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    console.error('❌ Unauthorized worker initialization attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🔐 Worker initialization authorized')
  startSyncWorker()

  return NextResponse.json({ success: true, message: 'Sync worker started' })
}

import { NextResponse } from 'next/server'
import { getSystemHealthStatus } from '@/lib/admin/health-status'
import { withAdminAuth } from '@/lib/api-keys/middleware'

export const GET = withAdminAuth(async (request) => {
  try {
    console.log(`🔍 [HEALTH-CHECK] Admin ${request.user?.email} requested system health status`)
    
    const healthStatus = await getSystemHealthStatus()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: healthStatus
    })
  } catch (error) {
    console.error('❌ [HEALTH-CHECK] Failed to get system health:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get system health status'
    }, { status: 500 })
  }
})
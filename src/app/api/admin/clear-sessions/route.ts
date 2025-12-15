import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withAdminAuth } from '@/lib/api-keys/middleware'

export const POST = withAdminAuth(async (request) => {
  try {
    console.log(`\n🚨 [CLEAR-SESSIONS] ADMIN ACTION INITIATED`)
    console.log(`👤 [CLEAR-SESSIONS] Admin User: ${request.user?.email}`)
    
    const adminUser = request.user
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    console.log(`🌐 [CLEAR-SESSIONS] Client IP: ${clientIP}`)
    console.log(`⏰ [CLEAR-SESSIONS] Timestamp: ${new Date().toISOString()}`)

    // Get count of sessions before deletion for logging
    const sessionCount = await prisma.session.count()
    console.log(`🔐 [ADMIN API] Found ${sessionCount} sessions to clear`)

    if (sessionCount === 0) {
      console.log(`🔐 [ADMIN API] No sessions found to clear`)
      return NextResponse.json({ 
        success: true, 
        message: 'No active sessions to clear.',
        deletedCount: 0
      })
    }

    // Delete all sessions from the database
    console.log(`🔐 [ADMIN API] Deleting ${sessionCount} sessions from database...`)
    // This will force all users to login again when their JWT expires or they refresh
    const result = await prisma.session.deleteMany()
    console.log(`🔐 [ADMIN API] Successfully deleted ${result.count} sessions from database`)

    // Create audit log entry for this critical admin action
    await prisma.analyticsEvent.create({
      data: {
        sessionId: `admin-clear-sessions-${Date.now()}`,
        userId: adminUser?.id,
        eventType: 'admin_clear_all_sessions',
        path: '/api/admin/clear-sessions',
        resourceType: 'admin_action',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: clientIP,
        eventData: {
          adminUserId: adminUser?.id,
          adminEmail: adminUser?.email,
          sessionsCleared: result.count,
          timestamp: new Date().toISOString()
        }
      }
    }).catch(error => {
      console.error('Failed to create audit log:', error)
      // Don't fail the main operation if audit logging fails
    })

    console.log(`🔐 ADMIN ACTION: ${adminUser?.email} (${clientIP}) cleared ${sessionCount} sessions from database`)
    console.log(`🔐 [ADMIN API] Sending success response to client`)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully cleared ${sessionCount} sessions. Users will be logged out when their tokens expire or they refresh.`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('Error clearing sessions:', error)
    return NextResponse.json({ 
      error: 'Failed to clear sessions' 
    }, { status: 500 })
  }
})
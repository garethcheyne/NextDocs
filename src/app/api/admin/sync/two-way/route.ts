import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { syncExternalChanges } from '@/lib/sync/two-way-sync-worker'

/**
 * Manually trigger two-way sync
 * Admin only
 */
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await syncExternalChanges()

    return NextResponse.json({
      success: true,
      stats,
      message: `Synced ${stats.updated} features, ${stats.conflicts} conflicts detected`
    })
  } catch (error) {
    console.error('Error in two-way sync:', error)
    return NextResponse.json(
      { error: 'Failed to sync', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Get sync status and conflicts
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/db/prisma')

    const [conflicts, syncEnabled, lastSync] = await Promise.all([
      // Count conflicts
      prisma.featureRequest.count({
        where: { syncConflict: true }
      }),
      // Count sync-enabled features
      prisma.featureRequest.count({
        where: { syncEnabled: true }
      }),
      // Get most recent sync
      prisma.featureRequest.findFirst({
        where: { lastSyncAt: { not: null } },
        orderBy: { lastSyncAt: 'desc' },
        select: { lastSyncAt: true }
      })
    ])

    return NextResponse.json({
      conflicts,
      syncEnabled,
      lastSync: lastSync?.lastSyncAt || null
    })
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}

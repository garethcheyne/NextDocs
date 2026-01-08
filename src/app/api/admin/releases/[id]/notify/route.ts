import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { notifyReleaseSubscribers } from '@/lib/email/notification-service'

/**
 * Send/resend notifications for a release (admin only)
 */
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

    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        teams: {
          select: { id: true, slug: true },
        },
      },
    })

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    if (release.teams.length === 0) {
      return NextResponse.json(
        { error: 'Release has no target teams' },
        { status: 400 }
      )
    }

    // Send notifications
    const result = await notifyReleaseSubscribers({
      releaseId: release.id,
      teams: release.teams.map((t) => t.slug),
      version: release.version,
      content: release.content,
      documentTitle: release.title || `Release ${release.version}`,
    })

    // Update notifiedAt
    await prisma.release.update({
      where: { id },
      data: { notifiedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      notificationsSent: result.sent,
    })
  } catch (error) {
    console.error('Failed to send release notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

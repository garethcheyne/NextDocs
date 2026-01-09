import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Toggle user's subscription to a team's release notifications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, subscribeToReleases, notifyEmail, notifyInApp } = body

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      )
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Upsert membership with subscription preferences
    const membership = await prisma.userTeamMembership.upsert({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
      update: {
        ...(subscribeToReleases !== undefined && { subscribeToReleases }),
        ...(notifyEmail !== undefined && { notifyEmail }),
        ...(notifyInApp !== undefined && { notifyInApp }),
      },
      create: {
        userId: session.user.id,
        teamId,
        subscribeToReleases: subscribeToReleases ?? true,
        notifyEmail: notifyEmail ?? true,
        notifyInApp: notifyInApp ?? true,
      },
    })

    return NextResponse.json({
      membership: {
        teamId: membership.teamId,
        subscribeToReleases: membership.subscribeToReleases,
        notifyEmail: membership.notifyEmail,
        notifyInApp: membership.notifyInApp,
      },
    })
  } catch (error) {
    console.error('Failed to update subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

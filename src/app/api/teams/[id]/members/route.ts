import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Get all members of a team (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const members = team.memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      userRole: m.user.role,
      teamRole: m.role,
      subscribeToReleases: m.subscribeToReleases,
      notifyEmail: m.notifyEmail,
      notifyInApp: m.notifyInApp,
      joinedAt: m.createdAt,
    }))

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

/**
 * Add a user to a team (admin only)
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
    const body = await request.json()
    const { userId, role, subscribeToReleases } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify team exists
    const team = await prisma.team.findUnique({ where: { id } })
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already a member
    const existing = await prisma.userTeamMembership.findUnique({
      where: { userId_teamId: { userId, teamId: id } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }

    const membership = await prisma.userTeamMembership.create({
      data: {
        userId,
        teamId: id,
        role: role || 'member',
        subscribeToReleases: subscribeToReleases ?? true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ membership }, { status: 201 })
  } catch (error) {
    console.error('Failed to add team member:', error)
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    )
  }
}

/**
 * Remove a user from a team (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    const membership = await prisma.userTeamMembership.findUnique({
      where: { userId_teamId: { userId, teamId: id } },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this team' },
        { status: 404 }
      )
    }

    await prisma.userTeamMembership.delete({
      where: { userId_teamId: { userId, teamId: id } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}

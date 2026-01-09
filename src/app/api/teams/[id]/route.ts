import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: { memberships: true, releases: true },
        },
        memberships: {
          where: { userId: session.user.id },
          select: {
            subscribeToReleases: true,
            notifyEmail: true,
            notifyInApp: true,
            role: true,
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json({
      team: {
        ...team,
        memberCount: team._count.memberships,
        releaseCount: team._count.releases,
        isSubscribed: team.memberships?.[0]?.subscribeToReleases ?? false,
      },
    })
  } catch (error) {
    console.error('Failed to fetch team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { name, slug, description, icon, color, enabled } = body

    // Check if slug is being changed and if it conflicts
    if (slug) {
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
          { status: 400 }
        )
      }

      const existing = await prisma.team.findUnique({
        where: { slug },
      })

      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: 'A team with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(enabled !== undefined && { enabled }),
      },
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Failed to update team:', error)
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}

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

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: { memberships: true, releases: true },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Delete team (memberships will cascade, releases will be disconnected)
    await prisma.team.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      deletedMemberships: team._count.memberships,
    })
  } catch (error) {
    console.error('Failed to delete team:', error)
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Get a specific release (admin only)
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

    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            iconBase64: true,
          },
        },
        teams: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        featureRequests: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    })

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    return NextResponse.json({ release })
  } catch (error) {
    console.error('Failed to fetch release:', error)
    return NextResponse.json({ error: 'Failed to fetch release' }, { status: 500 })
  }
}

/**
 * Update a release (admin only)
 */
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
    const { version, title, content, categoryId, teamIds, featureRequestIds } = body

    const existing = await prisma.release.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    // Validate version format if provided
    if (version) {
      const versionRegex = /^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/
      if (!versionRegex.test(version)) {
        return NextResponse.json(
          { error: 'Version must be in format yyyy.mm.dd or yyyy.mm.dd.sub' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (version !== undefined) updateData.version = version
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (categoryId !== undefined) updateData.categoryId = categoryId || null

    // Update teams if provided
    if (teamIds !== undefined) {
      if (teamIds.length === 0) {
        // Target all teams
        const allTeams = await prisma.team.findMany({
          where: { enabled: true },
          select: { id: true },
        })
        updateData.teams = { set: allTeams.map((t) => ({ id: t.id })) }
      } else {
        updateData.teams = { set: teamIds.map((id: string) => ({ id })) }
      }
    }

    // Update feature requests if provided
    if (featureRequestIds !== undefined) {
      updateData.featureRequests = { set: featureRequestIds.map((id: string) => ({ id })) }
    }

    const release = await prisma.release.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        teams: {
          select: { id: true, name: true, slug: true, color: true },
        },
        featureRequests: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    })

    return NextResponse.json({ release })
  } catch (error) {
    console.error('Failed to update release:', error)
    return NextResponse.json({ error: 'Failed to update release' }, { status: 500 })
  }
}

/**
 * Delete a release (admin only)
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

    const existing = await prisma.release.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    await prisma.release.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete release:', error)
    return NextResponse.json({ error: 'Failed to delete release' }, { status: 500 })
  }
}

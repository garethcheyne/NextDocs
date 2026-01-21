import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { notificationCoordinator } from '@/lib/notifications'

/**
 * Get all releases (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const teamId = searchParams.get('teamId')
    const source = searchParams.get('source')

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (source) where.source = source
    if (teamId) {
      where.teams = { some: { id: teamId } }
    }

    const releases = await prisma.release.findMany({
      where,
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
        _count: {
          select: {
            teams: true,
            featureRequests: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({ releases })
  } catch (error) {
    console.error('Failed to fetch releases:', error)
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 })
  }
}

/**
 * Create a new release (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { version, title, content, categoryId, teamIds, featureRequestIds, sendNotifications } = body

    if (!version || !content) {
      return NextResponse.json(
        { error: 'Version and content are required' },
        { status: 400 }
      )
    }

    // Validate version format (yyyy.mm.dd.sub)
    const versionRegex = /^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/
    if (!versionRegex.test(version)) {
      return NextResponse.json(
        { error: 'Version must be in format yyyy.mm.dd or yyyy.mm.dd.sub' },
        { status: 400 }
      )
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.featureCategory.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
    }

    // Validate teams
    let teams: { id: string; slug: string }[] = []
    if (teamIds && teamIds.length > 0) {
      teams = await prisma.team.findMany({
        where: { id: { in: teamIds }, enabled: true },
        select: { id: true, slug: true },
      })
      if (teams.length !== teamIds.length) {
        return NextResponse.json({ error: 'One or more teams not found' }, { status: 404 })
      }
    } else {
      // If no teams specified, target all enabled teams
      teams = await prisma.team.findMany({
        where: { enabled: true },
        select: { id: true, slug: true },
      })
    }

    // Validate feature requests if provided
    let featureRequests: { id: string }[] = []
    if (featureRequestIds && featureRequestIds.length > 0) {
      featureRequests = await prisma.featureRequest.findMany({
        where: { id: { in: featureRequestIds } },
        select: { id: true },
      })
      if (featureRequests.length !== featureRequestIds.length) {
        return NextResponse.json({ error: 'One or more feature requests not found' }, { status: 404 })
      }
    }

    // Create the release
    const release = await prisma.release.create({
      data: {
        version,
        title: title || null,
        content,
        categoryId: categoryId || null,
        source: 'manual',
        createdById: session.user.id,
        teams: {
          connect: teams.map((t) => ({ id: t.id })),
        },
        featureRequests: featureRequests.length > 0
          ? { connect: featureRequests.map((f) => ({ id: f.id })) }
          : undefined,
      },
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

    // Send notifications if requested
    let notificationsSent = 0
    if (sendNotifications && teams.length > 0) {
      try {
        const result = await notificationCoordinator.notifyReleasePublished({
          releaseId: release.id,
          teams: teams.map((t) => t.slug),
          version: release.version,
          content: release.content,
          documentTitle: release.title || `Release ${release.version}`,
        })
        notificationsSent = result.totalSent
      } catch (notifyError) {
        console.error('Failed to send release notifications:', notifyError)
      }
    }

    return NextResponse.json({
      release,
      notificationsSent,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create release:', error)
    return NextResponse.json({ error: 'Failed to create release' }, { status: 500 })
  }
}

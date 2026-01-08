import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Get releases for the current user based on their team memberships
 * If user has no team memberships, returns all releases
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const categoryId = searchParams.get('categoryId')

    // Get user's team memberships
    const userTeams = await prisma.userTeamMembership.findMany({
      where: { userId: session.user.id },
      select: { teamId: true },
    })

    const teamIds = userTeams.map((t) => t.teamId)

    // Build query - if user has teams, filter by those teams
    const where: any = {}
    if (teamIds.length > 0) {
      where.teams = { some: { id: { in: teamIds } } }
    }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const [releases, total] = await Promise.all([
      prisma.release.findMany({
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
          featureRequests: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.release.count({ where }),
    ])

    return NextResponse.json({
      releases,
      total,
      limit,
      offset,
      userTeamCount: teamIds.length,
    })
  } catch (error) {
    console.error('Failed to fetch releases:', error)
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Get teams by their slugs - used by release notification blocks in markdown
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slugsParam = searchParams.get('slugs')

    if (!slugsParam) {
      return NextResponse.json(
        { error: 'slugs parameter is required' },
        { status: 400 }
      )
    }

    const slugs = slugsParam.split(',').map((s) => s.trim().toLowerCase())

    const teams = await prisma.team.findMany({
      where: {
        slug: { in: slugs },
        enabled: true,
      },
      include: {
        memberships: {
          where: { userId: session.user.id },
          select: {
            subscribeToReleases: true,
          },
        },
      },
    })

    const result = teams.map((team) => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      color: team.color,
      icon: team.icon,
      isSubscribed: team.memberships[0]?.subscribeToReleases ?? false,
    }))

    return NextResponse.json({ teams: result })
  } catch (error) {
    console.error('Failed to fetch teams by slugs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

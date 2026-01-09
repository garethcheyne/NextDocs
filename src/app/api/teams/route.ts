import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeSubscriptions = searchParams.get('includeSubscriptions') === 'true'
    const enabledOnly = searchParams.get('enabledOnly') !== 'false'

    const teams = await prisma.team.findMany({
      where: enabledOnly ? { enabled: true } : undefined,
      orderBy: { name: 'asc' },
      include: includeSubscriptions
        ? {
            memberships: {
              where: { userId: session.user.id },
              select: {
                subscribeToReleases: true,
                notifyEmail: true,
                notifyInApp: true,
                role: true,
              },
            },
            _count: {
              select: { memberships: true },
            },
          }
        : {
            _count: {
              select: { memberships: true },
            },
          },
    })

    // Transform to include subscription status
    const result = teams.map((team) => {
      // Type assertion for conditional include
      const teamWithMemberships = team as typeof team & {
        memberships?: Array<{
          subscribeToReleases: boolean
          notifyEmail: boolean
          notifyInApp: boolean
          role: string | null
        }>
      }

      return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        icon: team.icon,
        color: team.color,
        enabled: team.enabled,
        memberCount: team._count.memberships,
        ...(includeSubscriptions && {
          isSubscribed: teamWithMemberships.memberships?.[0]?.subscribeToReleases ?? false,
          notifyEmail: teamWithMemberships.memberships?.[0]?.notifyEmail ?? true,
          notifyInApp: teamWithMemberships.memberships?.[0]?.notifyInApp ?? true,
          role: teamWithMemberships.memberships?.[0]?.role ?? null,
        }),
      }
    })

    return NextResponse.json({ teams: result })
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, icon, color, enabled } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.team.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A team with this slug already exists' },
        { status: 400 }
      )
    }

    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color: color || null,
        enabled: enabled !== undefined ? enabled : true,
      },
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('Failed to create team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

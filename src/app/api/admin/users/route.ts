import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Get all users (admin only)
 * Used for user selection dropdowns
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const excludeTeamId = searchParams.get('excludeTeamId')
    const includeTeams = searchParams.get('includeTeams') === 'true'

    const where: any = {
      active: true,
    }

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Exclude users already in a specific team
    if (excludeTeamId) {
      where.NOT = {
        teamMemberships: {
          some: { teamId: excludeTeamId },
        },
      }
    }

    if (includeTeams) {
      // Query with teams included
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          teamMemberships: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
        },
        orderBy: [{ name: 'asc' }, { email: 'asc' }],
        take: 50,
      })

      const result = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        teams: user.teamMemberships.map((m) => m.team),
      }))

      return NextResponse.json({ users: result })
    } else {
      // Query without teams
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
        orderBy: [{ name: 'asc' }, { email: 'asc' }],
        take: 50,
      })

      return NextResponse.json({ users })
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

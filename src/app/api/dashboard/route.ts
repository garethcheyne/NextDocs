import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { getAuthorsData } from '@/lib/authors-data'

/**
 * Get dashboard data for the current user
 * - Releases for their teams
 * - Recent blog posts
 * - Feature requests they're involved with (voted, commented, or following)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's team memberships
    const userTeams = await prisma.userTeamMembership.findMany({
      where: { userId },
      select: {
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
    })

    const teamIds = userTeams.map((t) => t.teamId)

    // Fetch all data in parallel
    const [releases, blogPosts, votedFeatures, followedFeatures, myFeatures] = await Promise.all([
      // Releases for user's teams (or all if no teams)
      prisma.release.findMany({
        where: teamIds.length > 0
          ? { teams: { some: { id: { in: teamIds } } } }
          : {},
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
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),

      // Recent blog posts
      prisma.blogPost.findMany({
        where: {
          isDraft: false,
          publishedAt: { lte: new Date() },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          author: true,
          featuredImage: true,
          publishedAt: true,
          repository: {
            select: {
              slug: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),

      // Feature requests user has voted on (with recent activity)
      prisma.featureRequest.findMany({
        where: {
          votes: { some: { userId } },
          isArchived: false,
        },
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
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy: { lastActivityAt: 'desc' },
        take: 5,
      }),

      // Feature requests user is following
      prisma.featureRequest.findMany({
        where: {
          followers: { some: { userId } },
          isArchived: false,
        },
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
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy: { lastActivityAt: 'desc' },
        take: 5,
      }),

      // Feature requests created by the user
      prisma.featureRequest.findMany({
        where: {
          createdBy: userId,
          isArchived: false,
        },
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
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy: { lastActivityAt: 'desc' },
        take: 5,
      }),
    ])

    // Combine and deduplicate feature requests
    const featureMap = new Map<string, any>()

    // Add my features first (highest priority)
    myFeatures.forEach((f) => featureMap.set(f.id, { ...f, involvement: 'created' }))

    // Add followed features
    followedFeatures.forEach((f) => {
      if (!featureMap.has(f.id)) {
        featureMap.set(f.id, { ...f, involvement: 'following' })
      }
    })

    // Add voted features
    votedFeatures.forEach((f) => {
      if (!featureMap.has(f.id)) {
        featureMap.set(f.id, { ...f, involvement: 'voted' })
      }
    })

    // Convert to array and sort by last activity
    const involvedFeatures = Array.from(featureMap.values())
      .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
      .slice(0, 10)

    // Get new feature requests (last 7 days)
    const newFeatures = await prisma.featureRequest.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isArchived: false,
      },
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
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Fetch author data for blog posts efficiently
    const authorSlugs = blogPosts.map((post) => post.author).filter(Boolean) as string[]
    let blogAuthorsObject: Record<string, any> = {}
    
    if (authorSlugs.length > 0) {
      try {
        // Use getAuthorsData utility which has caching and batch fetching
        const authorsDataMap = await getAuthorsData(authorSlugs)
        
        // Convert Map to plain object
        authorsDataMap.forEach((data, slug) => {
          blogAuthorsObject[slug] = data
        })
      } catch (authorError) {
        console.error('Error fetching blog authors (non-fatal):', authorError)
        // Continue without author data rather than failing the entire request
      }
    }

    return NextResponse.json({
      user: {
        teams: userTeams.map((t) => t.team),
      },
      releases,
      blogPosts,
      blogAuthors: blogAuthorsObject,
      involvedFeatures,
      newFeatures,
    })
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's created features
    const createdFeatures = await prisma.featureRequest.findMany({
      where: {
        createdBy: session.user.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        priority: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 items
    })

    // Fetch user's liked features
    const likedFeatures = await prisma.featureRequest.findMany({
      where: {
        votes: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        priority: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Fetch user's followed features
    const followedFeatures = await prisma.featureRequest.findMany({
      where: {
        followers: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        priority: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Fetch user's recent comments
    const recentComments = await prisma.featureComment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        feature: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    // Transform the data to match the expected format
    const transformedCreatedFeatures = createdFeatures.map((feature: any) => ({
      ...feature,
      likesCount: feature._count.likes,
      commentsCount: feature._count.comments,
      createdAt: feature.createdAt.toISOString(),
    }))

    const transformedLikedFeatures = likedFeatures.map((feature: any) => ({
      ...feature,
      likesCount: feature._count.likes,
      commentsCount: feature._count.comments,
      createdAt: feature.createdAt.toISOString(),
    }))

    const transformedFollowedFeatures = followedFeatures.map((feature: any) => ({
      ...feature,
      likesCount: feature._count.likes,
      commentsCount: feature._count.comments,
      createdAt: feature.createdAt.toISOString(),
    }))

    return NextResponse.json({
      createdFeatures: transformedCreatedFeatures,
      likedFeatures: transformedLikedFeatures,
      followedFeatures: transformedFollowedFeatures,
      recentComments,
    })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    )
  }
}
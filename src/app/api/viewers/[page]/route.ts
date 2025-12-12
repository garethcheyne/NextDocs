import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page URL is required' },
        { status: 400 }
      )
    }

    // Get viewers who have been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const viewers = await prisma.pageViewer.findMany({
      where: {
        page: page,
        lastSeen: {
          gte: fiveMinutesAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        lastSeen: 'desc',
      },
    })

    // Filter out current user and map to cleaner format
    const otherViewers = viewers
      .filter((viewer) => viewer.userId !== session.user.id)
      .map((viewer) => ({
        id: viewer.user.id,
        name: viewer.user.name || viewer.user.email,
        email: viewer.user.email,
        image: viewer.user.image,
        lastSeen: viewer.lastSeen,
      }))

    return NextResponse.json({
      viewers: otherViewers,
      total: otherViewers.length,
    })
  } catch (error) {
    console.error('Get viewers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch viewers' },
      { status: 500 }
    )
  }
}
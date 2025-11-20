import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Get events from last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    
    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: twoMinutesAgo }
      },
      select: {
        id: true,
        eventType: true,
        path: true,
        resourceId: true,
        ipAddress: true,
        userAgent: true,
        referrer: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Realtime analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch realtime events' },
      { status: 500 }
    )
  }
}

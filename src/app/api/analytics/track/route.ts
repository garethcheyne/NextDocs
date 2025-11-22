import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const headersList = await headers()
    
    const {
      sessionId,
      userId,
      eventType,
      eventData,
      path,
      scrollDepth,
      duration,
    } = body
    
    // Validate userId exists in database if provided
    let validUserId: string | undefined = undefined
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      })
      if (userExists) {
        validUserId = userId
      }
    }
    
    // Extract request metadata
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
    const userAgent = headersList.get('user-agent')
    const referrer = headersList.get('referer')
    
    // Determine resource type from path
    let resourceType = null
    let resourceId = null
    let category = null
    
    if (path.startsWith('/docs/')) {
      resourceType = 'doc'
      resourceId = path.replace('/docs/', '')
      const parts = resourceId.split('/')
      category = parts[0]
    } else if (path.startsWith('/blog/')) {
      resourceType = 'blog'
      resourceId = path.replace('/blog/', '')
    } else if (path.startsWith('/features')) {
      resourceType = 'feature'
      const match = path.match(/\/features\/(.+)/)
      if (match) resourceId = match[1]
    } else if (path.startsWith('/api-specs/')) {
      resourceType = 'api_spec'
      resourceId = path.replace('/api-specs/', '')
    }
    
    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        ...(validUserId && { userId: validUserId }),
        eventType,
        eventData,
        path,
        resourceId,
        resourceType,
        category,
        ipAddress,
        userAgent,
        referrer,
        duration,
        scrollDepth,
      }
    })
    
    // Update or create session
    await prisma.analyticsSession.upsert({
      where: { sessionId },
      update: {
        lastActivityAt: new Date(),
        eventsCount: { increment: 1 },
        ...(eventType === 'page_view' && {
          pageViews: { increment: 1 }
        })
      },
      create: {
        sessionId,
        ...(validUserId && { userId: validUserId }),
        ipAddress,
        userAgent,
        pageViews: eventType === 'page_view' ? 1 : 0,
        eventsCount: 1,
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

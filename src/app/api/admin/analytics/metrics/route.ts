import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const searchParams = req.nextUrl.searchParams
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const userFilter = searchParams.get('userFilter')
  
  // Default to last 30 days if not specified
  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam ? new Date(fromParam) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  try {
    const metrics = await getAnalyticsMetrics(from, to, userFilter)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Analytics metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics metrics' },
      { status: 500 }
    )
  }
}

async function getAnalyticsMetrics(from: Date, to: Date, userFilter: string | null) {
  const where: any = {
    createdAt: { gte: from, lte: to }
  }
  
  if (userFilter === 'authenticated') {
    where.userId = { not: null }
  } else if (userFilter === 'anonymous') {
    where.userId = null
  }
  
  // Get all metrics in parallel
  const [
    totalEvents,
    uniqueUsers,
    totalSessions,
    loginAttempts,
    documentReads,
    searches,
    featureViews,
    topPages,
    topDocuments,
    timeline
  ] = await Promise.all([
    // Total events count
    prisma.analyticsEvent.count({ where }),
    
    // Unique authenticated users
    prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
      _count: true
    }),
    
    // Total sessions
    prisma.analyticsSession.count({
      where: {
        startedAt: { gte: from, lte: to },
        ...(userFilter === 'authenticated' && { userId: { not: null } }),
        ...(userFilter === 'anonymous' && { userId: null })
      }
    }),
    
    // Login attempts (success vs failure)
    prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        ...where,
        eventType: { in: ['login_success', 'login_failure'] }
      },
      _count: true
    }),
    
    // Document reads count
    prisma.analyticsEvent.count({
      where: { ...where, eventType: 'document_read' }
    }),
    
    // Search queries count
    prisma.analyticsEvent.count({
      where: { ...where, eventType: 'search' }
    }),
    
    // Feature views count
    prisma.analyticsEvent.count({
      where: { ...where, eventType: 'feature_view' }
    }),
    
    // Top pages by view count
    prisma.analyticsEvent.groupBy({
      by: ['path'],
      where: { ...where, eventType: 'page_view' },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10
    }),
    
    // Top documents with avg duration and scroll depth
    prisma.analyticsEvent.groupBy({
      by: ['resourceId'],
      where: {
        ...where,
        eventType: 'document_read',
        resourceType: 'doc',
        resourceId: { not: null }
      },
      _count: { resourceId: true },
      _avg: { duration: true, scrollDepth: true },
      orderBy: { _count: { resourceId: 'desc' } },
      take: 10
    }),
    
    // Daily timeline aggregation using raw query
    prisma.$queryRaw<Array<{
      date: Date
      page_views: bigint
      sessions: bigint
      users: bigint
    }>>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) FILTER (WHERE "eventType" = 'page_view') as page_views,
        COUNT(DISTINCT "sessionId") as sessions,
        COUNT(DISTINCT "userId") FILTER (WHERE "userId" IS NOT NULL) as users
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `
  ])
  
  return {
    summary: {
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      totalSessions,
      loginSuccess: loginAttempts.find(l => l.eventType === 'login_success')?._count || 0,
      loginFailure: loginAttempts.find(l => l.eventType === 'login_failure')?._count || 0,
      documentReads,
      searches,
      featureViews
    },
    topPages: topPages.map(p => ({
      path: p.path,
      views: p._count.path
    })),
    topDocuments: topDocuments.map(d => ({
      resourceId: d.resourceId,
      views: d._count.resourceId,
      avgDuration: d._avg.duration ? Math.round(d._avg.duration) : null,
      avgScrollDepth: d._avg.scrollDepth ? Math.round(d._avg.scrollDepth) : null
    })),
    timeline: timeline.map(t => ({
      date: t.date.toISOString().split('T')[0],
      pageViews: Number(t.page_views),
      sessions: Number(t.sessions),
      users: Number(t.users)
    }))
  }
}

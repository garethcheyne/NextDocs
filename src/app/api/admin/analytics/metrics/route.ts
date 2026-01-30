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
    topUsers,
    timeline,
    sessionMetrics,
    topReferrers,
    deviceBreakdown,
    browserBreakdown,
    osBreakdown,
    searchAnalytics,
    peakHours,
    returningUsers
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
    
    // Top active users by event count
    prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    }).then(async (userGroups) => {
      // Fetch user details for the top users
      const userIds = userGroups.map(g => g.userId!)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true }
      })
      
      return userGroups.map(group => {
        const user = users.find(u => u.id === group.userId)
        return {
          userId: group.userId!,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          activityCount: group._count.userId
        }
      })
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
    `,
    
    // Session metrics (avg duration, bounce rate)
    prisma.$queryRaw<Array<{
      avg_duration: number | null
      avg_page_views: number | null
      total_sessions: bigint
      bounce_sessions: bigint
    }>>`
      SELECT
        AVG(EXTRACT(EPOCH FROM ("lastActivityAt" - "startedAt")) * 1000) as avg_duration,
        AVG("pageViews") as avg_page_views,
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE "pageViews" <= 1) as bounce_sessions
      FROM "AnalyticsSession"
      WHERE "startedAt" >= ${from} AND "startedAt" <= ${to}
    `,
    
    // Top referrers
    prisma.analyticsEvent.groupBy({
      by: ['referrer'],
      where: {
        ...where,
        AND: [
          { referrer: { not: null } },
          { referrer: { not: '' } }
        ]
      },
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 10
    }),
    
    // Device breakdown
    prisma.$queryRaw<Array<{
      device_type: string
      count: bigint
    }>>`
      SELECT
        CASE
          WHEN "userAgent" ILIKE '%mobile%' OR "userAgent" ILIKE '%iphone%' THEN 'mobile'
          WHEN "userAgent" ILIKE '%tablet%' OR "userAgent" ILIKE '%ipad%' THEN 'tablet'
          ELSE 'desktop'
        END as device_type,
        COUNT(*) as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        AND "userAgent" IS NOT NULL
      GROUP BY device_type
    `,
    
    // Browser breakdown
    prisma.$queryRaw<Array<{
      browser: string
      count: bigint
    }>>`
      SELECT
        CASE
          WHEN "userAgent" ILIKE '%edg%' THEN 'Edge'
          WHEN "userAgent" ILIKE '%chrome%' AND "userAgent" NOT ILIKE '%edg%' THEN 'Chrome'
          WHEN "userAgent" ILIKE '%firefox%' THEN 'Firefox'
          WHEN "userAgent" ILIKE '%safari%' AND "userAgent" NOT ILIKE '%chrome%' THEN 'Safari'
          ELSE 'Other'
        END as browser,
        COUNT(*) as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        AND "userAgent" IS NOT NULL
      GROUP BY browser
      ORDER BY count DESC
    `,
    
    // OS breakdown
    prisma.$queryRaw<Array<{
      os: string
      count: bigint
    }>>`
      SELECT
        CASE
          WHEN "userAgent" ILIKE '%windows%' THEN 'Windows'
          WHEN "userAgent" ILIKE '%mac%' AND "userAgent" NOT ILIKE '%iphone%' AND "userAgent" NOT ILIKE '%ipad%' THEN 'macOS'
          WHEN "userAgent" ILIKE '%linux%' THEN 'Linux'
          WHEN "userAgent" ILIKE '%android%' THEN 'Android'
          WHEN "userAgent" ILIKE '%ios%' OR "userAgent" ILIKE '%iphone%' OR "userAgent" ILIKE '%ipad%' THEN 'iOS'
          ELSE 'Other'
        END as os,
        COUNT(*) as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        AND "userAgent" IS NOT NULL
      GROUP BY os
      ORDER BY count DESC
    `,
    
    // Search analytics
    prisma.$queryRaw<Array<{
      query: string
      search_count: bigint
      avg_results: number | null
    }>>`
      SELECT
        "eventData"->>'searchQuery' as query,
        COUNT(*) as search_count,
        AVG(("eventData"->>'searchResults')::numeric) as avg_results
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        AND "eventType" = 'search'
        AND "eventData" IS NOT NULL
      GROUP BY query
      ORDER BY search_count DESC
      LIMIT 20
    `,
    
    // Peak activity hours
    prisma.$queryRaw<Array<{
      hour: number
      event_count: bigint
    }>>`
      SELECT
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as event_count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY hour
      ORDER BY hour ASC
    `,
    
    // Returning users
    prisma.$queryRaw<Array<{
      new_users: bigint
      returning_users: bigint
    }>>`
      WITH user_first_activity AS (
        SELECT 
          "userId",
          MIN("createdAt") as first_activity
        FROM "AnalyticsEvent"
        WHERE "userId" IS NOT NULL
        GROUP BY "userId"
      )
      SELECT
        COUNT(*) FILTER (WHERE ufa.first_activity >= ${from}) as new_users,
        COUNT(*) FILTER (WHERE ufa.first_activity < ${from}) as returning_users
      FROM "AnalyticsEvent" ae
      JOIN user_first_activity ufa ON ae."userId" = ufa."userId"
      WHERE ae."createdAt" >= ${from} AND ae."createdAt" <= ${to}
        AND ae."userId" IS NOT NULL
    `
  ])
  
  const sessionData = sessionMetrics[0] || { avg_duration: null, avg_page_views: null, total_sessions: 0n, bounce_sessions: 0n }
  const avgSessionDuration = sessionData.avg_duration ? Math.round(sessionData.avg_duration) : 0
  const bounceRate = Number(sessionData.total_sessions) > 0 
    ? Math.round((Number(sessionData.bounce_sessions) / Number(sessionData.total_sessions)) * 100) 
    : 0
  
  const returningUserData = returningUsers[0] || { new_users: 0n, returning_users: 0n }
  
  return {
    summary: {
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      totalSessions,
      loginSuccess: loginAttempts.find(l => l.eventType === 'login_success')?._count || 0,
      loginFailure: loginAttempts.find(l => l.eventType === 'login_failure')?._count || 0,
      documentReads,
      searches,
      featureViews,
      avgSessionDuration,
      bounceRate,
      newUsers: Number(returningUserData.new_users),
      returningUsers: Number(returningUserData.returning_users)
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
    topUsers: topUsers,
    timeline: timeline.map(t => ({
      date: t.date.toISOString().split('T')[0],
      pageViews: Number(t.page_views),
      sessions: Number(t.sessions),
      users: Number(t.users)
    })),
    topReferrers: topReferrers.map(r => ({
      referrer: r.referrer || 'Direct',
      count: r._count.referrer
    })),
    deviceBreakdown: deviceBreakdown.map(d => ({
      device: d.device_type,
      count: Number(d.count)
    })),
    browserBreakdown: browserBreakdown.map(b => ({
      browser: b.browser,
      count: Number(b.count)
    })),
    osBreakdown: osBreakdown.map(o => ({
      os: o.os,
      count: Number(o.count)
    })),
    searchAnalytics: searchAnalytics
      .filter(s => s.query && s.query.trim() !== '')
      .map(s => ({
        query: s.query,
        searches: Number(s.search_count),
        avgResults: s.avg_results ? Math.round(s.avg_results) : 0,
        hasNoResults: s.avg_results === 0
      })),
    peakHours: peakHours.map(h => ({
      hour: Number(h.hour),
      events: Number(h.event_count)
    }))
  }
}

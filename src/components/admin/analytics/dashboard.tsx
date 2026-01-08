'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, Eye, Search, TrendingUp, Activity, Monitor, Smartphone, Tablet, Globe } from 'lucide-react'

interface MetricsData {
  summary: {
    totalEvents: number
    uniqueUsers: number
    totalSessions: number
    loginSuccess: number
    loginFailure: number
    documentReads: number
    searches: number
    featureViews: number
  }
  topPages: Array<{ path: string; views: number }>
  topDocuments: Array<{ resourceId: string; views: number; avgDuration: number | null; avgScrollDepth: number | null }>
  timeline: Array<{ date: string; pageViews: number; sessions: number; users: number }>
}

interface RealtimeEvent {
  id: string
  eventType: string
  path: string
  resourceId: string | null
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  createdAt: string
  user: { name: string; email: string } | null
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange] = useState(() => {
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { from: from.toISOString(), to: to.toISOString() }
  })

  // Fetch metrics
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const params = new URLSearchParams({
          from: dateRange.from,
          to: dateRange.to
        })
        const response = await fetch(`/api/admin/analytics/metrics?${params}`)
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [dateRange])

  // Fetch realtime events
  useEffect(() => {
    async function fetchRealtime() {
      try {
        const response = await fetch('/api/admin/analytics/realtime')
        if (response.ok) {
          const data = await response.json()
          setRealtimeEvents(data.events)
        }
      } catch (error) {
        console.error('Failed to fetch realtime events:', error)
      }
    }

    fetchRealtime()
    const interval = setInterval(fetchRealtime, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'desktop' as const }

    // Detect browser
    let browser = 'Unknown'
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome'
    else if (ua.includes('Edg')) browser = 'Edge'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'

    // Detect OS
    let os = 'Unknown'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

    // Detect device type
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop'
    if (ua.includes('Mobile') || ua.includes('iPhone')) device = 'mobile'
    else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'tablet'

    return { browser, os, device }
  }

  const getDeviceIcon = (device: 'desktop' | 'mobile' | 'tablet') => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-3 w-3" />
      case 'tablet': return <Tablet className="h-3 w-3" />
      default: return <Monitor className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Failed to load analytics</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.summary.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-green-600 dark:text-green-400">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.summary.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Authenticated users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-purple-600 dark:text-purple-400">Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.summary.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-orange-600 dark:text-orange-400">Document Reads</CardTitle>
            <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.summary.documentReads.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">{metrics.summary.searches} searches</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Timeline */}
        <Card >
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Daily page views, sessions, and users over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.timeline && metrics.timeline.length > 0 ? (
              <div className="space-y-4">
                {/* Debug info */}
                <div className="text-xs text-muted-foreground mb-2">
                  Total days: {metrics.timeline.length} | Max views: {Math.max(...metrics.timeline.map(d => d.pageViews))} | Total views: {metrics.timeline.reduce((sum, d) => sum + d.pageViews, 0)}
                </div>
                <div className="h-64 flex items-end justify-between gap-1">
                  {metrics.timeline.map((day, index) => {
                    const maxValue = Math.max(...metrics.timeline.map(d => d.pageViews))
                    const heightPercent = maxValue > 0 ? Math.round((day.pageViews / maxValue) * 100) : 0
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full relative group h-full flex items-end">
                          <div
                            className={`w-full bg-gradient-to-t from-brand-orange to-orange-500 rounded-t transition-all hover:from-orange-600 hover:to-orange-400 ${heightPercent === 0 && day.pageViews > 0 ? 'min-h-[2px]' : ''}`}
                            style={{ height: heightPercent > 0 ? `${heightPercent}%` : (day.pageViews > 0 ? '2px' : '0') }}
                          />
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-gray-700">
                            <div className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-orange-400">{day.pageViews} views</div>
                            <div className="text-purple-400">{day.sessions} sessions</div>
                            <div className="text-green-400">{day.users} users</div>
                          </div>
                        </div>
                        {index % 5 === 0 && (
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-brand-orange to-orange-500 rounded" />
                    <span className="text-gray-400">Page Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span className="text-gray-400">Sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-400">Users</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No timeline data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most viewed pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPages.slice(0, 10).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">{index + 1}</span>
                    <span className="text-sm truncate max-w-[300px]">{page.path}</span>
                  </div>
                  <Badge variant="secondary">{page.views.toLocaleString()}</Badge>
                </div>
              ))}
              {metrics.topPages.length === 0 && (
                <p className="text-sm text-muted-foreground">No page views yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Documents */}
        <Card >
          <CardHeader>
            <CardTitle>Top Documents</CardTitle>
            <CardDescription>Most read documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topDocuments.slice(0, 10).map((doc, index) => (
                <div key={doc.resourceId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">{index + 1}</span>
                    <div>
                      <div className="text-sm truncate max-w-[250px]">{doc.resourceId}</div>
                      {doc.avgDuration && (
                        <div className="text-xs text-muted-foreground">
                          Avg {Math.round(doc.avgDuration / 1000)}s · {doc.avgScrollDepth}% scroll
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">{doc.views.toLocaleString()}</Badge>
                </div>
              ))}
              {metrics.topDocuments.length === 0 && (
                <p className="text-sm text-muted-foreground">No document reads yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Events */}
      <Card >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Activity
          </CardTitle>
          <CardDescription>Events from the last 2 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realtimeEvents.map((event) => {
              const { browser, os, device } = parseUserAgent(event.userAgent)
              return (
                <div key={event.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={getEventVariant(event.eventType)}>
                        {formatEventType(event.eventType)}
                      </Badge>
                      <span className="text-sm font-medium">{event.path}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {event.user && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{event.user.name}</span>
                      </div>
                    )}
                    {event.ipAddress && (
                      <span className="font-mono">{event.ipAddress}</span>
                    )}
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(device)}
                      <span>{browser} on {os}</span>
                    </div>
                  </div>

                  {event.referrer && (
                    <div className="text-xs text-muted-foreground truncate">
                      From: {event.referrer}
                    </div>
                  )}
                </div>
              )
            })}
            {realtimeEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login Stats */}
      {(metrics.summary.loginSuccess > 0 || metrics.summary.loginFailure > 0) && (
        <Card >
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Login attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8">
              <div>
                <div className="text-2xl font-bold text-green-600">{metrics.summary.loginSuccess}</div>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{metrics.summary.loginFailure}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {metrics.summary.loginSuccess + metrics.summary.loginFailure > 0
                    ? Math.round((metrics.summary.loginSuccess / (metrics.summary.loginSuccess + metrics.summary.loginFailure)) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getEventVariant(eventType: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (eventType.includes('success')) return 'default'
  if (eventType.includes('failure')) return 'destructive'
  if (eventType.includes('read') || eventType.includes('view')) return 'secondary'
  return 'outline'
}

function formatEventType(eventType: string): string {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

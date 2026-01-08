'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Monitor, Smartphone, Tablet, Globe, User, Calendar, FileText, MapPin } from 'lucide-react'

interface AnalyticsEvent {
  id: string
  eventType: string
  path: string
  resourceId: string | null
  resourceType: string | null
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  duration: number | null
  scrollDepth: number | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  } | null
}

type GroupByOption = 'none' | 'user' | 'ip' | 'eventType' | 'path' | 'resourceType' | 'date'

export function AnalyticsDetailsTable() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [groupBy, setGroupBy] = useState<GroupByOption>('none')
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date()
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
  })

  useEffect(() => {
    async function fetchEvents() {
      try {
        const params = new URLSearchParams({
          from: dateRange.from,
          to: dateRange.to,
          limit: '1000'
        })
        const response = await fetch(`/api/admin/analytics/events?${params}`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events)
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [dateRange])

  // Apply filters
  useEffect(() => {
    let filtered = events

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event => 
        event.path?.toLowerCase().includes(query) ||
        event.resourceId?.toLowerCase().includes(query) ||
        event.user?.name?.toLowerCase().includes(query) ||
        event.user?.email?.toLowerCase().includes(query) ||
        event.ipAddress?.toLowerCase().includes(query)
      )
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter)
    }

    // User filter
    if (userFilter === 'authenticated') {
      filtered = filtered.filter(event => event.user !== null)
    } else if (userFilter === 'anonymous') {
      filtered = filtered.filter(event => event.user === null)
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, eventTypeFilter, userFilter])

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'desktop' as const }
    
    let browser = 'Unknown'
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome'
    else if (ua.includes('Edg')) browser = 'Edge'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
    
    let os = 'Unknown'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
    
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop'
    if (ua.includes('Mobile') || ua.includes('iPhone')) device = 'mobile'
    else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'tablet'
    
    return { browser, os, device }
  }

  const getDeviceIcon = (device: 'desktop' | 'mobile' | 'tablet') => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const formatEventType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getEventVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    if (type.includes('login_success') || type.includes('session_start')) return 'default'
    if (type.includes('login_failure')) return 'destructive'
    if (type.includes('document') || type.includes('read')) return 'secondary'
    return 'outline'
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-'
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const groupEvents = () => {
    if (groupBy === 'none') {
      return [{ key: 'all', events: filteredEvents }]
    }

    const grouped = new Map<string, AnalyticsEvent[]>()

    filteredEvents.forEach(event => {
      let key = ''
      switch (groupBy) {
        case 'user':
          key = event.user ? `${event.user.name} (${event.user.email})` : 'Anonymous'
          break
        case 'ip':
          key = event.ipAddress || 'Unknown IP'
          break
        case 'eventType':
          key = formatEventType(event.eventType)
          break
        case 'path':
          key = event.path
          break
        case 'resourceType':
          key = event.resourceType || 'None'
          break
        case 'date':
          key = new Date(event.createdAt).toLocaleDateString()
          break
      }

      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(event)
    })

    return Array.from(grouped.entries()).map(([key, events]) => ({
      key,
      events: events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }))
  }

  const uniqueEventTypes = Array.from(new Set(events.map(e => e.eventType)))

  if (loading) {
    return (
      <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    )
  }

  const groupedData = groupEvents()

  return (
    <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>
          Showing {filteredEvents.length} of {events.length} events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search path, user, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueEventTypes.map(type => (
                  <SelectItem key={type} value={type}>{formatEventType(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">User Type</label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="authenticated">Authenticated</SelectItem>
                <SelectItem value="anonymous">Anonymous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Group By</label>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupByOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="eventType">Event Type</SelectItem>
                <SelectItem value="path">Path</SelectItem>
                <SelectItem value="resourceType">Resource Type</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="space-y-6">
          {groupedData.map(group => (
            <div key={group.key} className="space-y-2">
              {groupBy !== 'none' && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">{group.events.length} events</Badge>
                  <span className="font-semibold">{group.key}</span>
                </div>
              )}
              
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Scroll</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.events.map((event) => {
                        const { browser, os, device } = parseUserAgent(event.userAgent)
                        return (
                          <TableRow key={event.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(event.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getEventVariant(event.eventType)}>
                                {formatEventType(event.eventType)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm max-w-xs truncate">
                              {event.path}
                              {event.resourceId && (
                                <div className="text-xs text-muted-foreground">
                                  {event.resourceId}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {event.user ? (
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3 w-3" />
                                  <span className="text-sm">{event.user.name}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Anonymous</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {event.ipAddress || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getDeviceIcon(device)}
                                <div className="text-xs">
                                  <div>{browser}</div>
                                  <div className="text-muted-foreground">{os}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDuration(event.duration)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {event.scrollDepth ? `${Math.round(event.scrollDepth)}%` : '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No events found matching your filters</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Monitor, Smartphone, Tablet, User, ArrowUpDown, Filter, ExternalLink, Copy } from 'lucide-react'
import { toast } from 'sonner'

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

// Define columns with sorting
const columns: ColumnDef<AnalyticsEvent>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(row.getValue("createdAt"))}
      </div>
    ),
  },
  {
    accessorKey: "eventType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant={getEventVariant(row.getValue("eventType"))}>
        {formatEventType(row.getValue("eventType"))}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "path",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Path
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className="font-mono text-sm max-w-md space-y-1">
          <div className="flex items-center gap-2">
            <span className="truncate">{event.path}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => {
                navigator.clipboard.writeText(event.path)
                toast.success('Path copied to clipboard')
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {event.resourceId && (
            <div className="text-xs text-muted-foreground truncate">
              ID: {event.resourceId}
            </div>
          )}
          {event.resourceType && (
            <Badge variant="outline" className="text-xs">
              {event.resourceType}
            </Badge>
          )}
        </div>
      )
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.getValue("user") as AnalyticsEvent['user']
      return user ? (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span className="text-sm">{user.name}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Anonymous</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const userA = rowA.getValue("user") as AnalyticsEvent['user']
      const userB = rowB.getValue("user") as AnalyticsEvent['user']
      const nameA = userA?.name || 'Anonymous'
      const nameB = userB?.name || 'Anonymous'
      return nameA.localeCompare(nameB)
    },
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          IP Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const ip = row.getValue("ipAddress") as string | null
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{ip || '-'}</span>
          {ip && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => {
                navigator.clipboard.writeText(ip)
                toast.success('IP copied to clipboard')
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "userAgent",
    header: "Device & Browser",
    cell: ({ row }) => {
      const { browser, os, device } = parseUserAgent(row.getValue("userAgent"))
      return (
        <div className="flex items-center gap-2">
          {getDeviceIcon(device)}
          <div className="text-xs space-y-0.5">
            <div className="font-medium">{browser}</div>
            <div className="text-muted-foreground">{os}</div>
            <Badge variant="secondary" className="text-xs capitalize">
              {device}
            </Badge>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "referrer",
    header: "Referrer",
    cell: ({ row }) => {
      const referrer = row.getValue("referrer") as string | null
      if (!referrer) return <span className="text-muted-foreground">-</span>
      
      try {
        const url = new URL(referrer)
        return (
          <div className="flex items-center gap-1 text-xs">
            <span className="truncate max-w-[150px]">{url.hostname}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => window.open(referrer, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )
      } catch {
        return <span className="text-xs truncate max-w-[150px]">{referrer}</span>
      }
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm">{formatDuration(row.getValue("duration"))}</div>
    ),
  },
  {
    accessorKey: "scrollDepth",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Scroll
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const depth = row.getValue("scrollDepth") as number | null
      return (
        <div className="text-sm">
          {depth ? `${Math.round(depth)}%` : '-'}
        </div>
      )
    },
  },
]

export function AnalyticsDetailsTable() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
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
  const filteredEvents = events.filter(event => {
    if (eventTypeFilter !== 'all' && event.eventType !== eventTypeFilter) {
      return false
    }
    if (userFilter === 'authenticated' && !event.user) {
      return false
    }
    if (userFilter === 'anonymous' && event.user) {
      return false
    }
    return true
  })

  const uniqueEventTypes = Array.from(new Set(events.map(e => e.eventType)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with title and stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Events</h2>
          <p className="text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex gap-4 items-end flex-1 min-w-[300px]">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">From Date</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">To Date</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2 min-w-[200px]">
          <label className="text-sm font-medium">Event Type</label>
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>, or IP address..."
        defaultPageSize={50}
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueEventTypes.map(type => (
                <SelectItem key={type} value={type}>{formatEventType(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 min-w-[200px]">
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
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredEvents}
        searchKey="path"
        searchPlaceholder="Search path, resource ID..."
      />
    </div>
  )
}

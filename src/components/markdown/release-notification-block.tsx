'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Calendar, Users, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ReleaseNotificationBlockProps {
  teams: string[]
  version: string
  content: string
  className?: string
}

interface TeamInfo {
  id: string
  name: string
  slug: string
  color?: string
  icon?: string
  isSubscribed: boolean
}

export function ReleaseNotificationBlock({
  teams,
  version,
  content,
  className,
}: ReleaseNotificationBlockProps) {
  const [teamInfo, setTeamInfo] = useState<TeamInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  // Parse version date (yyyy.mm.dd.sub format)
  const versionParts = version.split('.')
  let versionDate: Date | null = null
  let isNewRelease = false

  if (versionParts.length >= 3) {
    versionDate = new Date(
      parseInt(versionParts[0]),
      parseInt(versionParts[1]) - 1,
      parseInt(versionParts[2])
    )
    // Consider "new" if less than 7 days old
    isNewRelease = Date.now() - versionDate.getTime() < 7 * 24 * 60 * 60 * 1000
  }

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const response = await fetch(`/api/teams/by-slugs?slugs=${teams.join(',')}`)
        if (response.ok) {
          const data = await response.json()
          setTeamInfo(data.teams)
        }
      } catch (error) {
        console.error('Failed to fetch team info:', error)
      } finally {
        setLoading(false)
      }
    }

    if (teams.length > 0) {
      fetchTeamInfo()
    } else {
      setLoading(false)
    }
  }, [teams])

  const handleSubscribe = async (teamId: string, subscribe: boolean) => {
    setSubscribing(teamId)
    try {
      const response = await fetch('/api/teams/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, subscribeToReleases: subscribe }),
      })

      if (response.ok) {
        setTeamInfo((prev) =>
          prev.map((t) =>
            t.id === teamId ? { ...t, isSubscribed: subscribe } : t
          )
        )
        toast.success(
          subscribe
            ? 'Subscribed to release notifications'
            : 'Unsubscribed from release notifications'
        )
      } else {
        throw new Error('Failed to update subscription')
      }
    } catch (error) {
      toast.error('Failed to update subscription')
    } finally {
      setSubscribing(null)
    }
  }

  // Format display date
  const displayDate = versionDate
    ? versionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : version

  return (
    <Card
      className={cn(
        'my-6 border-l-4 border-l-brand-orange bg-gradient-to-r from-orange-500/5 to-transparent',
        isNewRelease && 'ring-2 ring-brand-orange/30',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-brand-orange" />
            Release Notes
            {isNewRelease && (
              <Badge
                variant="default"
                className="bg-brand-orange text-white ml-2"
              >
                NEW
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            <Calendar className="w-3 h-3 mr-1" />
            v{version}
          </Badge>
        </div>

        {/* Team badges and subscription buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="w-4 h-4" />
            Teams:
          </span>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : teamInfo.length > 0 ? (
            teamInfo.map((team) => (
              <div key={team.id} className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: team.color
                      ? `${team.color}20`
                      : undefined,
                    borderColor: team.color || undefined,
                  }}
                >
                  {team.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleSubscribe(team.id, !team.isSubscribed)}
                  disabled={subscribing === team.id}
                  title={
                    team.isSubscribed
                      ? 'Unsubscribe from notifications'
                      : 'Subscribe to notifications'
                  }
                >
                  {subscribing === team.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : team.isSubscribed ? (
                    <Bell className="w-3 h-3 text-brand-orange" />
                  ) : (
                    <BellOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            ))
          ) : (
            // Show raw team slugs if teams not found in DB
            teams.map((slug) => (
              <Badge key={slug} variant="outline">
                {slug}
              </Badge>
            ))
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Bell, BellOff, Loader2, Trash2, Calendar, Tag, Users, Filter, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/features/category-badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { toast, Toaster } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface Team {
  id: string
  name: string
  slug: string
  color: string | null
}

interface FeatureRequest {
  id: string
  title: string
  slug: string
  status: string
}

interface Release {
  id: string
  version: string
  title: string | null
  content: string
  source: string
  publishedAt: string
  notifiedAt: string | null
  createdAt: string
  category: Category | null
  teams: Team[]
  featureRequests: FeatureRequest[]
  createdBy: {
    id: string
    name: string | null
    email: string
  } | null
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [sendingNotification, setSendingNotification] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [releasesRes, categoriesRes, teamsRes] = await Promise.all([
        fetch('/api/admin/releases'),
        fetch('/api/admin/features/categories'),
        fetch('/api/teams?enabledOnly=true'),
      ])

      if (releasesRes.ok) {
        const data = await releasesRes.json()
        setReleases(data.releases || [])
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load releases')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!selectedRelease) return

    try {
      const response = await fetch(`/api/admin/releases/${selectedRelease.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete release')
      }

      setReleases(releases.filter((r) => r.id !== selectedRelease.id))
      toast.success('Release deleted')
    } catch (error) {
      toast.error('Failed to delete release')
    } finally {
      setDeleteDialogOpen(false)
      setSelectedRelease(null)
    }
  }

  const handleSendNotifications = async (release: Release) => {
    setSendingNotification(release.id)

    try {
      const response = await fetch(`/api/admin/releases/${release.id}/notify`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notifications')
      }

      toast.success(`Sent ${data.notificationsSent} notifications`)

      // Update the release in state
      setReleases(
        releases.map((r) =>
          r.id === release.id ? { ...r, notifiedAt: new Date().toISOString() } : r
        )
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send notifications')
    } finally {
      setSendingNotification(null)
    }
  }

  // Filter releases
  const filteredReleases = releases.filter((release) => {
    if (filterCategory !== 'all' && release.category?.id !== filterCategory) {
      return false
    }
    if (filterTeam !== 'all' && !release.teams.some((t) => t.id === filterTeam)) {
      return false
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Releases', href: '/admin/releases' },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              Release Management
            </h1>
            <p className="text-gray-400 mt-1">
              Create and manage release notifications
            </p>
          </div>
          <Link href="/admin/releases/new">
            <Button className="bg-brand-orange hover:bg-brand-orange/90">
              <Plus className="w-4 h-4 mr-2" />
              New Release
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Releases List */}
        <Card>
          <CardHeader>
            <CardTitle>Releases</CardTitle>
            <CardDescription>
              {filteredReleases.length} release{filteredReleases.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReleases.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No releases yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first release to notify team members
                </p>
                <Link href="/admin/releases/new">
                  <Button className="bg-brand-orange hover:bg-brand-orange/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Release
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReleases.map((release) => (
                  <div
                    key={release.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-lg font-semibold text-brand-orange">
                          v{release.version}
                        </span>
                        {release.title && (
                          <span className="text-white font-medium">{release.title}</span>
                        )}
                        <Badge variant={release.source === 'manual' ? 'default' : 'secondary'}>
                          {release.source}
                        </Badge>
                        {release.notifiedAt ? (
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            <Bell className="w-3 h-3 mr-1" />
                            Notified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            <BellOff className="w-3 h-3 mr-1" />
                            Not sent
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {release.content.slice(0, 200)}
                        {release.content.length > 200 ? '...' : ''}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {release.category && (
                          <div className="flex items-center gap-1">
                            <CategoryBadge category={release.category} />
                          </div>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {release.teams.length} team{release.teams.length !== 1 ? 's' : ''}
                        </span>
                        {release.featureRequests && release.featureRequests.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            {release.featureRequests.length} feature{release.featureRequests.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(release.publishedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {release.teams.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {release.teams.slice(0, 5).map((team) => (
                            <Badge
                              key={team.id}
                              variant="outline"
                              className="text-xs"
                              style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                            >
                              {team.name}
                            </Badge>
                          ))}
                          {release.teams.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{release.teams.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                      {release.featureRequests && release.featureRequests.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          <Lightbulb className="w-3 h-3 text-yellow-500 mr-1" />
                          {release.featureRequests.slice(0, 3).map((feature) => (
                            <Link
                              key={feature.id}
                              href={`/features/${feature.slug}`}
                              className="hover:underline"
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                              >
                                {feature.title.length > 25 ? feature.title.slice(0, 25) + '...' : feature.title}
                              </Badge>
                            </Link>
                          ))}
                          {release.featureRequests.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{release.featureRequests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendNotifications(release)}
                        disabled={sendingNotification === release.id || release.teams.length === 0}
                      >
                        {sendingNotification === release.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => {
                          setSelectedRelease(release)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Release</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete release v{selectedRelease?.version}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  )
}

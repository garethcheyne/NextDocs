'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Megaphone,
  FileText,
  Lightbulb,
  Loader2,
  ChevronRight,
  Users,
  Sparkles,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ReleaseCard } from '@/components/cards/release-card'
import { BlogPostCard } from '@/components/cards/blog-post-card'
import { FeatureRequestCard } from '@/components/cards/feature-request-card'
import { FeatureActivityCard } from '@/components/cards/feature-activity-card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Team {
  id: string
  name: string
  slug: string
  color: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  iconBase64?: string | null
}

interface Release {
  id: string
  version: string
  title: string | null
  content: string
  publishedAt: string
  category: Category | null
  teams: Team[]
  featureRequests: { id: string; title: string; slug: string }[]
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  author: string | null
  featuredImage: string | null
  publishedAt: string | null
  repository: { slug: string } | null
}

interface FeatureRequest {
  id: string
  title: string
  slug: string
  status: string
  lastActivityAt: string
  involvement?: string
  category: Category | null
  creator?: { id: string; name: string | null; image: string | null } | null
  _count: {
    votes: number
    comments: number
  }
}

interface DashboardData {
  user: {
    teams: Team[]
  }
  releases: Release[]
  blogPosts: BlogPost[]
  involvedFeatures: FeatureRequest[]
  newFeatures: FeatureRequest[]
}

const statusColors: Record<string, string> = {
  proposal: 'bg-yellow-500',
  approved: 'bg-purple-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
  declined: 'bg-red-500',
  'on-hold': 'bg-orange-500',
}

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isNewRelease(publishedAt: string) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return new Date(publishedAt).getTime() > sevenDaysAgo
}

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login?callbackUrl=/home')
            return
          }
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
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
            { label: 'Home', href: '/home' },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening across your teams
            </p>
          </div>
          {data?.user.teams && data.user.teams.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Your teams:</span>
              <div className="flex gap-1">
                {data.user.teams.slice(0, 3).map((team) => (
                  <Badge
                    key={team.id}
                    variant="outline"
                    style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                  >
                    {team.name}
                  </Badge>
                ))}
                {data.user.teams.length > 3 && (
                  <Badge variant="secondary">+{data.user.teams.length - 3}</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Releases */}
          <Card >
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-green-500" />
                <CardTitle>Recent Releases</CardTitle>
              </div>
              <Link href="/releases">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data?.releases && data.releases.length > 0 ? (
                <div className="space-y-4">
                  {data.releases.map((release) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      isNew={isNewRelease(release.publishedAt)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No releases for your teams yet</p>
                </div>
              )}


            </CardContent>
          </Card>

          {/* Recent Blog Posts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <CardTitle>Recent Blog Posts</CardTitle>
              </div>
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data?.blogPosts && data.blogPosts.length > 0 ? (
                <div className="space-y-4">
                  {data.blogPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No blog posts yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Feature Requests */}
          <Card >
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <CardTitle>New Feature Requests</CardTitle>
              </div>
              <Link href="/features">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Recently submitted - your vote matters!
              </CardDescription>
              {data?.newFeatures && data.newFeatures.length > 0 ? (
                <div className="space-y-3">
                  {data.newFeatures.map((feature) => (
                    <FeatureRequestCard
                      key={feature.id}
                      feature={feature}
                      statusColors={statusColors}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No new feature requests this week</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Feature Activity */}
          <Card >
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                <CardTitle>Your Feature Activity</CardTitle>
              </div>
              <Link href="/features">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Features you've created, voted on, or are following
              </CardDescription>
              {data?.involvedFeatures && data.involvedFeatures.length > 0 ? (
                <div className="space-y-3">
                  {data.involvedFeatures.map((feature) => (
                    <FeatureActivityCard
                      key={feature.id}
                      feature={feature}
                      statusColors={statusColors}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't interacted with any features yet</p>
                  <Link href="/features">
                    <Button variant="link" className="mt-2">
                      Browse Feature Requests
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

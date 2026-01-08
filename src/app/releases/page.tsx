'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Megaphone,
  Loader2,
  Calendar,
  Tag,
  Users,
  Lightbulb,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/features/category-badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { EnhancedMarkdown } from '@/components/ui/enhanced-markdown'

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
  publishedAt: string
  category: Category | null
  teams: Team[]
  featureRequests: FeatureRequest[]
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isNewRelease(publishedAt: string) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return new Date(publishedAt).getTime() > sevenDaysAgo
}

export default function ReleasesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [releases, setReleases] = useState<Release[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [userTeamCount, setUserTeamCount] = useState(0)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [expandedReleases, setExpandedReleases] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [releasesRes, categoriesRes] = await Promise.all([
          fetch(`/api/releases?limit=50${filterCategory !== 'all' ? `&categoryId=${filterCategory}` : ''}`),
          fetch('/api/categories'),
        ])

        if (!releasesRes.ok) {
          if (releasesRes.status === 401) {
            router.push('/login?callbackUrl=/releases')
            return
          }
          throw new Error('Failed to fetch releases')
        }

        const releasesData = await releasesRes.json()
        setReleases(releasesData.releases || [])
        setTotal(releasesData.total || 0)
        setUserTeamCount(releasesData.userTeamCount || 0)

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, filterCategory])

  const toggleRelease = (id: string) => {
    setExpandedReleases((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

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
            { label: 'Home', href: '/home' },
            { label: 'Releases', href: '/releases' },
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
              Release Notes
            </h1>
            <p className="text-muted-foreground mt-1">
              {userTeamCount > 0
                ? `Showing releases for your ${userTeamCount} team${userTeamCount !== 1 ? 's' : ''}`
                : 'Showing all releases'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            {total} release{total !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Releases List */}
        {releases.length === 0 ? (
          <Card >
            <CardContent className="py-12">
              <div className="text-center">
                <Megaphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Releases Yet</h3>
                <p className="text-muted-foreground">
                  {userTeamCount > 0
                    ? "There are no releases for your teams yet. Check back later!"
                    : "No releases have been published yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {releases.map((release) => (
              <Card key={release.id}>
                <Collapsible
                  open={expandedReleases.has(release.id)}
                  onOpenChange={() => toggleRelease(release.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-lg px-3 py-1 text-green-500 border-green-500/50"
                            >
                              v{release.version}
                            </Badge>
                            {release.title && (
                              <CardTitle className="text-xl">{release.title}</CardTitle>
                            )}
                            {isNewRelease(release.publishedAt) && (
                              <Badge className="bg-green-500 text-white">NEW</Badge>
                            )}
                          </div>

                          <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(release.publishedAt)}
                            </span>
                            {release.category && (
                              <div className="flex items-center gap-1">
                                <CategoryBadge category={release.category} />
                              </div>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {release.teams.length} team{release.teams.length !== 1 ? 's' : ''}
                            </span>
                            {release.featureRequests.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Lightbulb className="w-4 h-4" />
                                {release.featureRequests.length} feature{release.featureRequests.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition-transform ${expandedReleases.has(release.id) ? 'rotate-180' : ''
                            }`}
                        />
                      </div>

                      {/* Teams badges */}
                      {release.teams.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {release.teams.map((team) => (
                            <Badge
                              key={team.id}
                              variant="outline"
                              className="text-xs"
                              style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                            >
                              {team.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t border-gray-800/50">
                      {/* Release Content */}
                      <div className="prose prose-sm max-w-none dark:prose-invert mt-4">
                        <EnhancedMarkdown>{release.content}</EnhancedMarkdown>
                      </div>

                      {/* Linked Feature Requests */}
                      {release.featureRequests.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-800/50">
                          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Related Feature Requests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {release.featureRequests.map((feature) => (
                              <Link
                                key={feature.id}
                                href={`/features/${feature.slug}`}
                              >
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-secondary/80"
                                >
                                  {feature.title}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

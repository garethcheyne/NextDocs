'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send, Save, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/badges/category-badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { toast, Toaster } from 'sonner'
import { releaseTemplates } from '@/lib/markdown-templates'
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
  category?: {
    id: string
    name: string
    color: string | null
  } | null
}

export default function NewReleasePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([])

  // Form state
  const [version, setVersion] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set())
  const [targetAllTeams, setTargetAllTeams] = useState(true)
  const [sendNotifications, setSendNotifications] = useState(true)
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set())

  // Generate default version based on today's date
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    setVersion(`${year}.${month}.${day}.1`)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, teamsRes, featuresRes] = await Promise.all([
          fetch('/api/admin/features/categories'),
          fetch('/api/teams?enabledOnly=true'),
          fetch('/api/features?limit=100'),
        ])

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.categories || [])
        }

        if (teamsRes.ok) {
          const data = await teamsRes.json()
          setTeams(data.teams || [])
        }

        if (featuresRes.ok) {
          const data = await featuresRes.json()
          setFeatureRequests(data.features || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load form data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev)
      if (next.has(featureId)) {
        next.delete(featureId)
      } else {
        next.add(featureId)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!version.trim()) {
      toast.error('Version is required')
      return
    }

    if (!content.trim()) {
      toast.error('Content is required')
      return
    }

    // Validate version format
    const versionRegex = /^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/
    if (!versionRegex.test(version)) {
      toast.error('Version must be in format yyyy.mm.dd or yyyy.mm.dd.sub')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          title: title.trim() || null,
          content: content.trim(),
          categoryId: categoryId || null,
          teamIds: targetAllTeams ? [] : Array.from(selectedTeamIds),
          featureRequestIds: Array.from(selectedFeatureIds),
          sendNotifications,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create release')
      }

      if (sendNotifications && data.notificationsSent > 0) {
        toast.success(`Release created and ${data.notificationsSent} notifications sent`)
      } else {
        toast.success('Release created successfully')
      }

      router.push('/admin/releases')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create release')
    } finally {
      setIsSaving(false)
    }
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
            { label: 'Admin', href: '/admin' },
            { label: 'Releases', href: '/admin/releases' },
            { label: 'New Release', href: '/admin/releases/new' },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin/releases">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              New Release
            </h1>
            <p className="text-gray-400 mt-1">Create a new release notification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className=" space-y-6">
          {/* Main Content - Left Column */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Primary Details (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Version & Title */}
              <Card>
                <CardHeader>
                  <CardTitle>Release Details</CardTitle>
                  <CardDescription>Basic information about the release</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version *</Label>
                      <Input
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="yyyy.mm.dd.sub"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: yyyy.mm.dd or yyyy.mm.dd.sub
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (optional)</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., January Update"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <MarkdownInput
                      value={content}
                      onChange={setContent}
                      label="Content *"
                      placeholder="What's new in this release?"
                      rows={12}
                      maxLength={50000}
                      showCharCount={true}
                      templates={releaseTemplates}
                      showHelp={true}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature Request Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Linked Feature Requests
                  </CardTitle>
                  <CardDescription>
                    Tag feature requests that are addressed in this release (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featureRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No feature requests found</p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto border rounded-md p-3">
                        {featureRequests.map((feature) => (
                          <label
                            key={feature.id}
                            htmlFor={`feature-${feature.id}`}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          >
                            <Checkbox
                              id={`feature-${feature.id}`}
                              checked={selectedFeatureIds.has(feature.id)}
                              onCheckedChange={() => toggleFeature(feature.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">
                                {feature.title}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {feature.status}
                                </Badge>
                                {feature.category && (
                                  <CategoryBadge category={feature.category} />
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {selectedFeatureIds.size > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-2">Selected:</span>
                          {Array.from(selectedFeatureIds).map((id) => {
                            const feature = featureRequests.find((f) => f.id === id)
                            return feature ? (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {feature.title.length > 30 ? feature.title.slice(0, 30) + '...' : feature.title}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Settings Column (1/3 width) */}
            <div className="space-y-6">
              {/* Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                  <CardDescription>
                    Application category (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={categoryId || 'none'} onValueChange={(val) => setCategoryId(val === 'none' ? '' : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Team Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle>Target Teams</CardTitle>
                  <CardDescription>
                    Who receives this notification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="targetAll"
                      checked={targetAllTeams}
                      onCheckedChange={(checked) => setTargetAllTeams(checked === true)}
                    />
                    <Label htmlFor="targetAll" className="cursor-pointer">
                      All teams ({teams.length})
                    </Label>
                  </div>

                  {!targetAllTeams && (
                    <div className="space-y-3 max-h-[240px] overflow-y-auto border rounded-md p-3">
                      {teams.map((team) => (
                        <label
                          key={team.id}
                          htmlFor={`team-${team.id}`}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            id={`team-${team.id}`}
                            checked={selectedTeamIds.has(team.id)}
                            onCheckedChange={() => toggleTeam(team.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">
                              {team.name}
                            </span>
                          </div>
                          {team.color && (
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {!targetAllTeams && selectedTeamIds.size > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(selectedTeamIds).map((id) => {
                        const team = teams.find((t) => t.id === id)
                        return team ? (
                          <Badge
                            key={id}
                            variant="outline"
                            className="text-xs"
                            style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                          >
                            {team.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Send email notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendNotifications"
                      checked={sendNotifications}
                      onCheckedChange={(checked) => setSendNotifications(checked === true)}
                    />
                    <Label htmlFor="sendNotifications" className="cursor-pointer">
                      Send emails immediately
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Can be sent later from releases list
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : sendNotifications ? (
                <Send className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving
                ? 'Creating...'
                : sendNotifications
                  ? 'Create & Send Notifications'
                  : 'Create Release'}
            </Button>
            <Link href="/admin/releases">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>

      <Toaster />
    </>
  )
}

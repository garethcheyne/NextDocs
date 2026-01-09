'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send, Save, Lightbulb, HelpCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          {/* Version & Title */}
          <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
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
                    Format: yyyy.mm.dd or yyyy.mm.dd.sub
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
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's new in this release? (Markdown supported)"
                  rows={10}
                  className="font-mono text-sm"
                />

                {/* Markdown Help */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <HelpCircle className="w-4 h-4" />
                      Markdown Help
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 p-4 rounded-lg bg-muted/50 border text-sm space-y-4">
                      <p className="text-muted-foreground">
                        Use these formatting options to make your release notes easier to read:
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Headings */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Headings</h4>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            <div>## Section Title</div>
                            <div>### Subsection</div>
                          </div>
                        </div>

                        {/* Lists */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Bullet Lists</h4>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            <div>- First item</div>
                            <div>- Second item</div>
                            <div>- Third item</div>
                          </div>
                        </div>

                        {/* Bold & Italic */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Bold & Italic</h4>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            <div>**bold text**</div>
                            <div>*italic text*</div>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Links</h4>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            <div>[Link Text](https://url.com)</div>
                          </div>
                        </div>

                        {/* Code */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Inline Code</h4>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            <div>`code here`</div>
                          </div>
                        </div>

                        {/* Numbered Lists */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Numbered Lists</h4>
                          <div className="font-mono text-xs bg-background p-2 rounded border">
                            <div>1. First step</div>
                            <div>2. Second step</div>
                            <div>3. Third step</div>
                          </div>
                        </div>
                      </div>

                      {/* Example Template */}
                      <div className="pt-2 border-t">
                        <h4 className="font-semibold text-foreground mb-2">Example Template</h4>
                        <div className="font-mono text-xs bg-background p-3 rounded border whitespace-pre-wrap">
{`## What's New

- **New Feature**: Description of the new feature
- **Improvement**: What was improved

## Bug Fixes

- Fixed issue with login screen
- Resolved data export problem

## Notes

For questions, contact the support team.`}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setContent(`## What's New

- **New Feature**: Description of the new feature
- **Improvement**: What was improved

## Bug Fixes

- Fixed issue with...
- Resolved problem with...

## Notes

For questions, contact the support team.`)}
                        >
                          Use This Template
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Application Category</CardTitle>
              <CardDescription>
                Associate this release with an application category (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={categoryId || 'none'} onValueChange={(val) => setCategoryId(val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category (optional)" />
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

          {/* Feature Request Selection */}
          <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
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
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
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

          {/* Team Targeting */}
          <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Target Teams</CardTitle>
              <CardDescription>
                Choose which teams should receive this release notification
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
                  Target all teams ({teams.length} teams)
                </Label>
              </div>

              {!targetAllTeams && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-md p-3">
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
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {team.name}
                        </span>
                        <p className="text-xs text-muted-foreground">{team.slug}</p>
                      </div>
                      {team.color && (
                        <div
                          className="w-3 h-3 rounded-full"
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
          <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose whether to send email notifications immediately
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
                  Send email notifications to subscribed team members
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You can always send notifications later from the releases list
              </p>
            </CardContent>
          </Card>

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

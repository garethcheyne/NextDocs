'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GitBranch, Calendar, Activity, Settings, Trash2, RefreshCw, GripVertical, FolderTree, FileText, BookOpen, Users, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function formatTimeAgo(date: string | null): string {
  if (!date) return 'Never'
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [repository, setRepository] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [repoId, setRepoId] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [stats, setStats] = useState({ documents: 0, blogPosts: 0, authors: 0, parentCategories: 0 })
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [tooltipData, setTooltipData] = useState<Record<string, any>>({})
  const [loadingTooltip, setLoadingTooltip] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setRepoId(p.id))
  }, [params])

  useEffect(() => {
    if (repoId) {
      fetchRepository()
    }
  }, [repoId])

  const fetchRepository = async () => {
    if (!repoId) return
    
    try {
      const response = await fetch(`/api/repositories/${repoId}`)
      if (!response.ok) throw new Error('Failed to fetch repository')
      const data = await response.json()
      setRepository(data.repository)
      
      // Fetch categories
      const catResponse = await fetch(`/api/repositories/${repoId}/categories`)
      if (catResponse.ok) {
        const catData = await catResponse.json()
        setCategories(catData.categories)
      }

      // Fetch statistics
      const [docsRes, blogsRes, authorsRes, categoriesRes] = await Promise.all([
        fetch(`/api/repositories/${repoId}/documents/count`),
        fetch(`/api/repositories/${repoId}/blog-posts/count`),
        fetch(`/api/repositories/${repoId}/authors/count`),
        fetch(`/api/repositories/${repoId}/categories/count`),
      ])

      const documents = docsRes.ok ? (await docsRes.json()).count : 0
      const blogPosts = blogsRes.ok ? (await blogsRes.json()).count : 0
      const authors = authorsRes.ok ? (await authorsRes.json()).count : 0
      const parentCategories = categoriesRes.ok ? (await categoriesRes.json()).count : 0

      setStats({ documents, blogPosts, authors, parentCategories })
    } catch (error) {
      console.error('Failed to fetch repository:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!repoId) return
    
    setIsSyncing(true)
    try {
      const response = await fetch(`/api/repositories/${repoId}/sync`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Sync failed')
      
      // Refresh repository data after a short delay
      setTimeout(() => {
        fetchRepository()
        setIsSyncing(false)
      }, 2000)
    } catch (error) {
      console.error('Sync failed:', error)
      setIsSyncing(false)
    }
  }

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= categories.length) return
    
    const temp = newCategories[index]
    newCategories[index] = newCategories[targetIndex]
    newCategories[targetIndex] = temp
    
    setCategories(newCategories)
  }

  const saveCategoryOrder = async () => {
    if (!repoId) return
    
    setIsSavingOrder(true)
    try {
      const response = await fetch(`/api/repositories/${repoId}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      })
      
      if (!response.ok) throw new Error('Failed to save order')
      
      await fetchRepository()
    } catch (error) {
      console.error('Failed to save category order:', error)
    } finally {
      setIsSavingOrder(false)
    }
  }

  const fetchTooltipData = async (type: 'documents' | 'blogPosts' | 'authors' | 'categories') => {
    if (!repoId) return
    const key = `${repoId}-${type}`
    if (tooltipData[key] || loadingTooltip === key) return

    setLoadingTooltip(key)
    try {
      let endpoint = ''
      switch (type) {
        case 'documents':
          endpoint = `/api/repositories/${repoId}/documents/list`
          break
        case 'blogPosts':
          endpoint = `/api/repositories/${repoId}/blog-posts/list`
          break
        case 'authors':
          endpoint = `/api/repositories/${repoId}/authors/list`
          break
        case 'categories':
          endpoint = `/api/repositories/${repoId}/categories/list`
          break
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setTooltipData(prev => ({ ...prev, [key]: data.items }))
      }
    } catch (error) {
      console.error('Failed to fetch tooltip data:', error)
    } finally {
      setLoadingTooltip(null)
    }
  }

  if (isLoading) {
    return (
      <>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNavigation
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Repositories', href: '/admin/repositories' },
              { label: 'Loading...', href: '#' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh] overflow-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  if (!repository) {
    return (
      <>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNavigation
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Repositories', href: '/admin/repositories' },
              { label: 'Not Found', href: '#' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh] overflow-auto">
          <p className="text-muted-foreground">Repository not found</p>
        </div>
      </>
    )
  }

  const lastSync = repository.syncLogs[0]
  const statusMap = {
    success: 'Active',
    failed: 'Error',
    in_progress: 'Syncing',
  } as const
  const displayStatus = repository.enabled
    ? repository.lastSyncStatus
      ? statusMap[repository.lastSyncStatus as keyof typeof statusMap] || 'Pending'
      : 'Pending'
    : 'Disabled'

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNavigation
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Repositories', href: '/admin/repositories' },
              { label: repository.name, href: `/admin/repositories/${repoId}` },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/repositories">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">{repository.name}</h1>
                <p className="text-gray-400 mt-2">
                  {repository.source === 'azure'
                    ? `Azure DevOps • ${repository.organization}/${repository.project}`
                    : `GitHub • ${repository.owner}/${repository.repo}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/repositories/${repository.id}/edit`}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          <Card className={`border-2 ${
            displayStatus === 'Active'
              ? 'bg-green-500/10 border-green-500/50'
              : displayStatus === 'Error'
              ? 'bg-destructive/10 border-destructive/50'
              : displayStatus === 'Syncing'
              ? 'bg-blue-500/10 border-blue-500/50'
              : 'bg-yellow-500/10 border-yellow-500/50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${
                      displayStatus === 'Active' ? 'text-green-600 dark:text-green-400' :
                      displayStatus === 'Error' ? 'text-destructive' :
                      displayStatus === 'Syncing' ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {displayStatus}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last synced {formatTimeAgo(repository.lastSyncAt)}
                  </p>
                </div>
                <Button
                  onClick={handleSync}
                  disabled={!repository.enabled || displayStatus === 'Syncing' || isSyncing}
                  variant="default"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Repository Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Repository Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Source</p>
                      <p className="text-sm capitalize">{repository.source}</p>
                    </div>
                    {repository.source === 'azure' ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Organization</p>
                          <p className="text-sm">{repository.organization}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Project</p>
                          <p className="text-sm">{repository.project}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Repository</p>
                          <p className="text-sm">{repository.repositoryId}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Owner</p>
                          <p className="text-sm">{repository.owner}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Repository</p>
                          <p className="text-sm">{repository.repo}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Branch</p>
                      <p className="text-sm">{repository.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Base Path</p>
                      <p className="text-sm">{repository.basePath}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sync Frequency</p>
                      <p className="text-sm">
                        {repository.syncFrequency === 0
                          ? 'Manual only'
                          : repository.syncFrequency < 3600
                          ? `Every ${repository.syncFrequency / 60} minutes`
                          : repository.syncFrequency === 3600
                          ? 'Hourly'
                          : repository.syncFrequency < 86400
                          ? `Every ${repository.syncFrequency / 3600} hours`
                          : 'Daily'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm">{repository.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Management */}
              {categories.length > 0 && (() => {
                // Group categories by parent
                const parentCategories = categories.filter(c => !c.parentSlug)
                const childCategoriesMap = categories.reduce((acc, c) => {
                  if (c.parentSlug) {
                    if (!acc[c.parentSlug]) acc[c.parentSlug] = []
                    acc[c.parentSlug].push(c)
                  }
                  return acc
                }, {} as Record<string, any[]>)

                const toggleCategory = (slug: string) => {
                  setExpandedCategories(prev => {
                    const newSet = new Set(prev)
                    if (newSet.has(slug)) {
                      newSet.delete(slug)
                    } else {
                      newSet.add(slug)
                    }
                    return newSet
                  })
                }

                return (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Category Display Order
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Manage the order categories appear in the docs sidebar. Children are collapsed by default.
                          </CardDescription>
                        </div>
                        <Button
                          onClick={saveCategoryOrder}
                          disabled={isSavingOrder}
                          size="sm"
                        >
                          {isSavingOrder ? 'Saving...' : 'Save Order'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {parentCategories.map((category, index) => {
                          const children = childCategoriesMap[category.categorySlug] || []
                          const isExpanded = expandedCategories.has(category.categorySlug)
                          
                          return (
                            <div key={category.id}>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                {children.length > 0 && (
                                  <button
                                    onClick={() => toggleCategory(category.categorySlug)}
                                    className="hover:bg-muted rounded p-1"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </button>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{category.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {category.categorySlug}
                                    {children.length > 0 && ` • ${children.length} ${children.length === 1 ? 'child' : 'children'}`}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => moveCategory(index, 'up')}
                                    disabled={index === 0}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    onClick={() => moveCategory(index, 'down')}
                                    disabled={index === parentCategories.length - 1}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    ↓
                                  </Button>
                                </div>
                              </div>
                              {isExpanded && children.length > 0 && (
                                <div className="ml-12 mt-2 space-y-2">
                                  {children.map((child: any) => (
                                    <div
                                      key={child.id}
                                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-dashed"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm">{child.title}</p>
                                        <p className="text-xs text-muted-foreground">{child.categorySlug}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}

              {/* Sync History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Sync History
                  </CardTitle>
                  <CardDescription>
                    Recent synchronization attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {repository.syncLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No sync history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {repository.syncLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              log.status === 'success'
                                ? 'bg-green-500'
                                : log.status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {log.status === 'success'
                                  ? 'Sync completed'
                                  : log.status === 'failed'
                                  ? 'Sync failed'
                                  : 'Sync in progress'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(log.startedAt)}
                              </p>
                            </div>
                            {log.status === 'success' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {log.filesAdded} added, {log.filesChanged} changed, {log.filesDeleted} deleted
                                {log.duration && ` • ${(log.duration / 1000).toFixed(1)}s`}
                              </p>
                            )}
                            {log.error && (
                              <p className="text-xs text-destructive mt-1">{log.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Info */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-3 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer"
                          onMouseEnter={() => fetchTooltipData('documents')}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3 text-blue-400" />
                            <p className="text-xs font-medium text-blue-400">Documents</p>
                          </div>
                          <p className="text-2xl font-bold">{stats.documents}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs max-h-60 overflow-auto">
                        {loadingTooltip === `${repoId}-documents` ? (
                          <p className="text-xs">Loading...</p>
                        ) : tooltipData[`${repoId}-documents`]?.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-xs mb-1">Documents:</p>
                            {tooltipData[`${repoId}-documents`].slice(0, 10).map((doc: any, i: number) => (
                              <p key={i} className="text-xs truncate">{doc.title}</p>
                            ))}
                            {tooltipData[`${repoId}-documents`].length > 10 && (
                              <p className="text-xs opacity-70">+{tooltipData[`${repoId}-documents`].length - 10} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs">No documents</p>
                        )}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer"
                          onMouseEnter={() => fetchTooltipData('blogPosts')}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-3 h-3 text-purple-400" />
                            <p className="text-xs font-medium text-purple-400">Blog Posts</p>
                          </div>
                          <p className="text-2xl font-bold">{stats.blogPosts}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs max-h-60 overflow-auto">
                        {loadingTooltip === `${repoId}-blogPosts` ? (
                          <p className="text-xs">Loading...</p>
                        ) : tooltipData[`${repoId}-blogPosts`]?.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-xs mb-1">Blog Posts:</p>
                            {tooltipData[`${repoId}-blogPosts`].slice(0, 10).map((post: any, i: number) => (
                              <p key={i} className="text-xs truncate">{post.title}</p>
                            ))}
                            {tooltipData[`${repoId}-blogPosts`].length > 10 && (
                              <p className="text-xs opacity-70">+{tooltipData[`${repoId}-blogPosts`].length - 10} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs">No blog posts</p>
                        )}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-3 border border-green-500/20 hover:border-green-500/40 transition-colors cursor-pointer"
                          onMouseEnter={() => fetchTooltipData('authors')}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-green-400" />
                            <p className="text-xs font-medium text-green-400">Authors</p>
                          </div>
                          <p className="text-2xl font-bold">{stats.authors}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs max-h-60 overflow-auto">
                        {loadingTooltip === `${repoId}-authors` ? (
                          <p className="text-xs">Loading...</p>
                        ) : tooltipData[`${repoId}-authors`]?.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-xs mb-1">Authors:</p>
                            {tooltipData[`${repoId}-authors`].map((author: string, i: number) => (
                              <p key={i} className="text-xs truncate">{author}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs">No authors</p>
                        )}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg p-3 border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer"
                          onMouseEnter={() => fetchTooltipData('categories')}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FolderTree className="w-3 h-3 text-orange-400" />
                            <p className="text-xs font-medium text-orange-400">Categories</p>
                          </div>
                          <p className="text-2xl font-bold">{stats.parentCategories}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs max-h-60 overflow-auto">
                        {loadingTooltip === `${repoId}-categories` ? (
                          <p className="text-xs">Loading...</p>
                        ) : tooltipData[`${repoId}-categories`]?.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-xs mb-1">Categories:</p>
                            {tooltipData[`${repoId}-categories`].map((cat: any, i: number) => (
                              <p key={i} className="text-xs truncate">{cat.title}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs">No categories</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Separator className="my-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Syncs</p>
                    <p className="text-xl font-bold">{repository.syncLogs.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Successful</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {repository.syncLogs.filter((l: any) => l.status === 'success').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-xl font-bold text-destructive">
                      {repository.syncLogs.filter((l: any) => l.status === 'failed').length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(repository.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm">{repository.creator.name || repository.creator.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{new Date(repository.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Repository ID</p>
                    <p className="text-xs text-muted-foreground font-mono">{repository.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
  )
}

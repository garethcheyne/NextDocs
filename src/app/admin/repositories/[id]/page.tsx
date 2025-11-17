'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GitBranch, Calendar, Activity, Settings, Trash2, RefreshCw, GripVertical, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Navigation } from '@/components/layout/navigation'

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Repository not found</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Main Content */}
      <main className="container px-4 md:px-12 py-8">
        <div className="space-y-6">
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
                <h1 className="text-3xl font-bold">{repository.name}</h1>
                <p className="text-muted-foreground mt-1">
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
              {categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FolderTree className="w-5 h-5" />
                          Category Display Order
                        </CardTitle>
                        <CardDescription>
                          Manage the order categories appear in the docs sidebar
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
                      {categories.map((category, index) => (
                        <div
                          key={category.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{category.title}</p>
                            <p className="text-xs text-muted-foreground">{category.categorySlug}</p>
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
                              disabled={index === categories.length - 1}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Syncs</p>
                    <p className="text-2xl font-bold">{repository.syncLogs.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Successful Syncs</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {repository.syncLogs.filter((l: any) => l.status === 'success').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed Syncs</p>
                    <p className="text-2xl font-bold text-destructive">
                      {repository.syncLogs.filter((l: any) => l.status === 'failed').length}
                    </p>
                  </div>
                  {lastSync && lastSync.status === 'success' && (
                    <div>
                      <p className="text-xs text-muted-foreground">Documents</p>
                      <p className="text-2xl font-bold">
                        {lastSync.filesAdded + lastSync.filesChanged}
                      </p>
                    </div>
                  )}
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
      </main>
    </div>
  )
}

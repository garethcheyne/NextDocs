'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GitBranch, Plus, Search, RefreshCw, CheckCircle2, XCircle, FileText, BookOpen, Users, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function formatTimeAgo(date: string | null): string {
  if (!date) return 'Never'

  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return new Date(date).toLocaleDateString()
}

function formatSyncSchedule(frequency: number): string {
  if (frequency === 0) return 'Manual only'
  if (frequency < 3600) return `Every ${frequency / 60} minutes`
  if (frequency === 3600) return 'Hourly'
  if (frequency < 86400) return `Every ${frequency / 3600} hours`
  return 'Daily'
}

interface Repository {
  id: string
  name: string
  source: string
  organization: string | null
  project: string | null
  owner: string | null
  repo: string | null
  branch: string
  enabled: boolean
  lastSyncAt: string | null
  lastSyncStatus: string | null
  syncFrequency: number
  syncLogs: Array<{
    id: string
    filesAdded: number
    filesChanged: number
  }>
  _count: {
    syncLogs: number
    documents: number
    blogPosts: number
    categoryMetadata: number
  }
  authorCount: number
  parentCategoryCount: number
}

export default function RepositoriesClient({ initialRepositories }: { initialRepositories: Repository[] }) {
  const router = useRouter()
  const [repositories, setRepositories] = useState<Repository[]>(initialRepositories)
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [tooltipData, setTooltipData] = useState<Record<string, any>>({})
  const [loadingTooltip, setLoadingTooltip] = useState<string | null>(null)

  const handleSync = async (id: string) => {
    setSyncing({ ...syncing, [id]: true })
    try {
      const response = await fetch(`/api/repositories/${id}/sync`, {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh the page data after a short delay
        setTimeout(() => {
          router.refresh()
          setSyncing({ ...syncing, [id]: false })
        }, 2000)
      } else {
        setSyncing({ ...syncing, [id]: false })
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncing({ ...syncing, [id]: false })
    }
  }

  const handleTest = async (id: string) => {
    setTesting({ ...testing, [id]: true })
    try {
      const response = await fetch(`/api/repositories/${id}/test`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('✓ Connection successful!')
      } else {
        alert(`✗ Connection failed: ${data.error}`)
      }
    } catch (error) {
      alert(`✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTesting({ ...testing, [id]: false })
    }
  }

  const fetchTooltipData = async (repoId: string, type: 'documents' | 'blogPosts' | 'authors' | 'categories') => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
            Repository Management
          </h1>
          <p className="text-gray-400 mt-2">
            Connect and manage documentation repositories from Azure DevOps and GitHub
          </p>
        </div>
        <Link href="/admin/repositories/new">
          <Button className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Repository
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search repositories..."
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
              />
            </div>
            <select aria-label="Filter by provider" className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-brand-orange focus:outline-none">
              <option value="all">All Providers</option>
              <option value="azure">Azure DevOps</option>
              <option value="github">GitHub</option>
            </select>
            <select aria-label="Filter by status" className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-brand-orange focus:outline-none">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Repository Grid */}
      <div className="grid gap-4">
        {repositories.length === 0 ? (
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No repositories configured
                </h3>
                <p className="text-gray-400 mb-6">
                  Get started by connecting your first documentation repository
                </p>
                <Link href="/admin/repositories/new">
                  <Button className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Repository
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          repositories.map((repo) => {
            const lastSync = repo.syncLogs[0]
            const statusMap = {
              success: 'ACTIVE',
              failed: 'ERROR',
              in_progress: 'SYNCING',
            } as const

            const displayStatus = repo.enabled
              ? repo.lastSyncStatus
                ? statusMap[repo.lastSyncStatus as keyof typeof statusMap] || 'PENDING'
                : 'PENDING'
              : 'DISABLED'

            const syncDocCount = lastSync
              ? lastSync.filesAdded + lastSync.filesChanged
              : 0

            const isSyncing = syncing[repo.id] || displayStatus === 'SYNCING'
            const isTesting = testing[repo.id]

            return (
              <Card
                key={repo.id}
                className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl hover:border-brand-orange/50 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GitBranch className="w-5 h-5 text-brand-orange flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-white text-lg">
                          {repo.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {repo.source === 'azure'
                            ? `Azure DevOps • ${repo.organization}/${repo.project} • ${repo.branch} branch`
                            : `GitHub • ${repo.owner}/${repo.repo} • ${repo.branch} branch`}
                        </CardDescription>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${displayStatus === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : displayStatus === 'SYNCING'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : displayStatus === 'ERROR'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : displayStatus === 'DISABLED'
                                ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                    >
                      {displayStatus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    {/* Content Stats */}
                    <TooltipProvider>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer"
                              onMouseEnter={() => fetchTooltipData(repo.id, 'documents')}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <p className="text-xs font-medium text-blue-400">Documents</p>
                              </div>
                              <p className="text-3xl font-bold text-white">
                                {repo._count.documents}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs max-h-60 overflow-auto">
                            {loadingTooltip === `${repo.id}-documents` ? (
                              <p className="text-xs">Loading...</p>
                            ) : tooltipData[`${repo.id}-documents`]?.length > 0 ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-xs mb-1">Documents:</p>
                                {tooltipData[`${repo.id}-documents`].slice(0, 10).map((doc: any, i: number) => (
                                  <p key={i} className="text-xs truncate">{doc.title}</p>
                                ))}
                                {tooltipData[`${repo.id}-documents`].length > 10 && (
                                  <p className="text-xs opacity-70">+{tooltipData[`${repo.id}-documents`].length - 10} more</p>
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
                              className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer"
                              onMouseEnter={() => fetchTooltipData(repo.id, 'blogPosts')}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-purple-400" />
                                <p className="text-xs font-medium text-purple-400">Blog Posts</p>
                              </div>
                              <p className="text-3xl font-bold text-white">
                                {repo._count.blogPosts}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs max-h-60 overflow-auto">
                            {loadingTooltip === `${repo.id}-blogPosts` ? (
                              <p className="text-xs">Loading...</p>
                            ) : tooltipData[`${repo.id}-blogPosts`]?.length > 0 ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-xs mb-1">Blog Posts:</p>
                                {tooltipData[`${repo.id}-blogPosts`].slice(0, 10).map((post: any, i: number) => (
                                  <p key={i} className="text-xs truncate">{post.title}</p>
                                ))}
                                {tooltipData[`${repo.id}-blogPosts`].length > 10 && (
                                  <p className="text-xs opacity-70">+{tooltipData[`${repo.id}-blogPosts`].length - 10} more</p>
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
                              className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-colors cursor-pointer"
                              onMouseEnter={() => fetchTooltipData(repo.id, 'authors')}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-green-400" />
                                <p className="text-xs font-medium text-green-400">Authors</p>
                              </div>
                              <p className="text-3xl font-bold text-white">
                                {repo.authorCount}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs max-h-60 overflow-auto">
                            {loadingTooltip === `${repo.id}-authors` ? (
                              <p className="text-xs">Loading...</p>
                            ) : tooltipData[`${repo.id}-authors`]?.length > 0 ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-xs mb-1">Authors:</p>
                                {tooltipData[`${repo.id}-authors`].map((author: string, i: number) => (
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
                              className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer"
                              onMouseEnter={() => fetchTooltipData(repo.id, 'categories')}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <FolderTree className="w-4 h-4 text-orange-400" />
                                <p className="text-xs font-medium text-orange-400">Categories</p>
                              </div>
                              <p className="text-3xl font-bold text-white">
                                {repo.parentCategoryCount}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs max-h-60 overflow-auto">
                            {loadingTooltip === `${repo.id}-categories` ? (
                              <p className="text-xs">Loading...</p>
                            ) : tooltipData[`${repo.id}-categories`]?.length > 0 ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-xs mb-1">Categories:</p>
                                {tooltipData[`${repo.id}-categories`].map((cat: any, i: number) => (
                                  <p key={i} className="text-xs truncate">{cat.title}</p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs">No categories</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    {/* Sync Info */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700/50">
                      <span>Last sync: {formatTimeAgo(repo.lastSyncAt)}</span>
                      <span>{formatSyncSchedule(repo.syncFrequency)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/repositories/${repo.id}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => handleTest(repo.id)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => handleSync(repo.id)}
                      disabled={!repo.enabled || isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Link href={`/admin/repositories/${repo.id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Stats Summary */}
      {repositories.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Repositories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{repositories.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {repositories.filter((r) => r.enabled && r.lastSyncStatus === 'success').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Syncs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {repositories.reduce((acc, r) => acc + r._count.syncLogs, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {repositories.filter((r) => !r.lastSyncAt).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

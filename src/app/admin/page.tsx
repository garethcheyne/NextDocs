import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, GitBranch, Activity, Plus, BookOpen } from 'lucide-react'
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
import { prisma } from '@/lib/db/prisma'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  if (session.user?.role?.toLowerCase() !== 'admin') {
    redirect('/docs')
  }

  // Fetch real statistics
  const [repositories, users, recentActivity] = await Promise.all([
    prisma.repository.findMany({
      include: {
        syncLogs: {
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
    prisma.syncLog.findMany({
      take: 5,
      orderBy: { startedAt: 'desc' },
      include: {
        repository: true,
      },
    }),
  ])

  const totalRepos = repositories.length
  const activeRepos = repositories.filter(
    (r) => r.enabled && r.lastSyncStatus === 'success'
  ).length
  const pendingRepos = repositories.filter((r) => !r.lastSyncAt).length
  const totalDocs = repositories.reduce(
    (acc, r) => acc + (r.syncLogs[0]?.filesAdded || 0) + (r.syncLogs[0]?.filesChanged || 0),
    0
  )
  const lastSync = repositories.reduce((latest, r) => {
    if (!r.lastSyncAt) return latest
    return !latest || r.lastSyncAt > latest ? r.lastSyncAt : latest
  }, null as Date | null)

  function formatTimeAgo(date: Date | null): string {
    if (!date) return 'Never'
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
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
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
              {/* Welcome Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription>
                    Manage repositories, monitor sync status, and view system activity
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Stats Overview */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Repositories
                      </CardTitle>
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalRepos}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeRepos} active, {pendingRepos} pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Documents
                      </CardTitle>
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalDocs}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalRepos > 0 ? `Across ${totalRepos} repositories` : 'No repositories'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Users
                      </CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Sync Status
                      </CardTitle>
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {activeRepos > 0 ? 'OK' : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last sync: {formatTimeAgo(lastSync)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Link href="/admin/repositories/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Repository
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    Trigger Sync
                  </Button>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              {/* Repository Management */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Recent Repositories</h2>
                    <p className="text-sm text-muted-foreground mt-1">Latest 3 repositories</p>
                  </div>
                  <Link href="/admin/repositories">
                    <Button variant="outline">
                      View All Repositories
                    </Button>
                  </Link>
                </div>

                {repositories.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No repositories configured
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Get started by connecting your first documentation repository
                        </p>
                        <Link href="/admin/repositories/new">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Repository
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                {repositories.slice(0, 3).map((repo) => {
                  const lastSync = repo.syncLogs[0]
                  const statusMap = {
                    success: 'Active',
                    failed: 'Error',
                    in_progress: 'Syncing',
                  } as const
                  const displayStatus = repo.enabled
                    ? repo.lastSyncStatus
                      ? statusMap[repo.lastSyncStatus as keyof typeof statusMap] || 'Pending'
                      : 'Pending'
                    : 'Disabled'

                  return (
                    <Card key={repo.id} className="hover:border-primary hover:shadow-md transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                              <GitBranch className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">
                                {repo.name}
                              </CardTitle>
                              <CardDescription>
                                {repo.source === 'azure'
                                  ? `Azure DevOps • ${repo.organization}/${repo.project} • ${repo.branch} branch`
                                  : `GitHub • ${repo.owner}/${repo.repo} • ${repo.branch} branch`}
                              </CardDescription>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              displayStatus === 'Active'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : displayStatus === 'Error'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : displayStatus === 'Syncing'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : displayStatus === 'Disabled'
                                ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Last Sync</p>
                            <p className="text-sm">{formatTimeAgo(repo.lastSyncAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Documents</p>
                            <p className="text-sm">
                              {lastSync
                                ? `${lastSync.filesAdded + lastSync.filesChanged} files`
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sync Schedule</p>
                            <p className="text-sm">
                              {repo.syncFrequency < 3600
                                ? `Every ${repo.syncFrequency / 60} min`
                                : repo.syncFrequency === 3600
                                ? 'Hourly'
                                : repo.syncFrequency < 86400
                                ? `Every ${repo.syncFrequency / 3600}h`
                                : 'Daily'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/repositories/${repo.id}`}>
                            <Button size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/admin/repositories/${repo.id}/edit`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* System Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system events and sync operations
              </CardDescription>
            </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                  {recentActivity.map((log, index) => (
                    <div key={log.id} className={`flex items-start gap-3 text-sm pb-4 ${index < recentActivity.length - 1 ? 'border-b' : ''}`}>
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          log.status === 'success'
                            ? 'bg-green-500'
                            : log.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {log.status === 'success'
                            ? `Repository sync completed: ${log.repository.name}`
                            : log.status === 'failed'
                            ? `Repository sync failed: ${log.repository.name}`
                            : `Repository sync in progress: ${log.repository.name}`}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatTimeAgo(log.startedAt)}
                          {log.filesChanged > 0 || log.filesAdded > 0
                            ? ` • ${log.filesAdded + log.filesChanged} files updated`
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                  )}  
                </CardContent>
              </Card>
          </div>
    </>
  )
}
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, Bell, Settings, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db/prisma'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

export default async function AdminTeamsPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  if (session.user?.role?.toLowerCase() !== 'admin') {
    redirect('/')
  }

  // Fetch teams with member counts
  const teams = await prisma.team.findMany({
    include: {
      _count: {
        select: {
          memberships: true,
          releases: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Get total stats
  const totalMembers = await prisma.userTeamMembership.count()
  const totalSubscribed = await prisma.userTeamMembership.count({
    where: { subscribeToReleases: true },
  })
  const totalReleases = await prisma.release.count()

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Teams', href: '/admin/teams' },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              Teams / Business Units
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage teams for release notifications
            </p>
          </div>
          <Link href="/admin/teams/new">
            <Button className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Team
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Teams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                <CardTitle className="text-xs font-medium text-green-600 dark:text-green-400">Total Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-xs font-medium text-purple-600 dark:text-purple-400">Subscribed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSubscribed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-xs font-medium text-orange-600 dark:text-orange-400">Releases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReleases}</div>
            </CardContent>
          </Card>
        </div>

        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              Teams that users can subscribe to for release notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first team to start managing release notifications
                </p>
                <Link href="/admin/teams/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <Card key={team.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                            style={{ backgroundColor: team.color || '#ff6b35' }}
                          >
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{team.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {team.slug}
                              </Badge>
                              {!team.enabled && (
                                <Badge variant="secondary" className="text-xs">
                                  Disabled
                                </Badge>
                              )}
                            </div>
                            {team.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {team.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {team._count.memberships} members
                              </span>
                              <span className="flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                {team._count.releases} releases
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/admin/teams/${team.id}/members`}>
                            <Button variant="ghost" size="sm">
                              <Users className="w-4 h-4 mr-1" />
                              Members
                            </Button>
                          </Link>
                          <Link href={`/admin/teams/${team.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

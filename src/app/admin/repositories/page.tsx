import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import RepositoriesClient from '@/components/admin/repositories-client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

export default async function RepositoriesPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  if (session.user?.role?.toLowerCase() !== 'admin') {
    redirect('/docs')
  }

  // Fetch repositories from database with sync log counts
  const repositories = await prisma.repository.findMany({
    include: {
      syncLogs: {
        take: 1,
        orderBy: { startedAt: 'desc' },
      },
      _count: {
        select: { syncLogs: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize dates to strings for client component
  const serializedRepositories = repositories.map((repo) => ({
    ...repo,
    lastSyncAt: repo.lastSyncAt?.toISOString() || null,
    createdAt: repo.createdAt.toISOString(),
    updatedAt: repo.updatedAt.toISOString(),
  }))

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
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 overflow-auto">
        <RepositoriesClient initialRepositories={serializedRepositories as any} />
      </div>
    </>
  )
}

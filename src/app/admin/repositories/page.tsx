import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import RepositoriesClient from '@/components/admin/repositories-client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { PanelLeft, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between w-full gap-2 px-4">
          <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1">
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block">
                <ChevronRight />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block">
                <ChevronRight />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Repositories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-12 py-6 overflow-auto">
        <div className="max-w-7xl">
          <RepositoriesClient initialRepositories={serializedRepositories as any} />
        </div>
      </main>
    </>
  )
}

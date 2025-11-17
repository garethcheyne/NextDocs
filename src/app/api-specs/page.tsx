import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { PanelLeft, ChevronRight, FileText } from 'lucide-react'
import {
  Card,
} from '@/components/ui/card'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function ApiDocsPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  // Fetch all enabled API specifications
  const apiSpecs = await prisma.aPISpec.findMany({
    where: {
      enabled: true,
    },
    include: {
      repository: true,
    },
    orderBy: [
      { slug: 'asc' },
      { version: 'desc' }, // Latest version first
    ],
  })

  // Group API specs by slug to show all versions
  const groupedSpecs = apiSpecs.reduce((acc, spec) => {
    if (!acc[spec.slug]) {
      acc[spec.slug] = []
    }
    acc[spec.slug].push(spec)
    return acc
  }, {} as Record<string, typeof apiSpecs>)

  // Prepare API specs for sidebar
  const sidebarApiSpecs = apiSpecs.map(spec => ({
    slug: spec.slug,
    name: spec.name,
    category: spec.category,
    version: spec.version,
  }))

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={session.user} currentPath="/api-specs" apiSpecs={sidebarApiSpecs} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
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
                    <BreadcrumbPage>API Documentation</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-12 py-6 overflow-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
              <p className="text-muted-foreground">
                Browse and explore our API specifications
              </p>
            </div>

            {Object.keys(groupedSpecs).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  No API specifications available
                </h2>
                <p className="text-muted-foreground max-w-md">
                  There are currently no API specifications to display. Check back
                  later or contact your administrator.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedSpecs).map(([slug, versions]) => {
                  const latestSpec = versions[0] // Latest version (sorted desc)
                  return (
                    <Card key={slug} className="h-full hover:shadow-lg transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold line-clamp-2">
                            {latestSpec.name}
                          </h3>
                        </div>
                        
                        {latestSpec.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {latestSpec.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {latestSpec.category && (
                            <Badge variant="outline" className="text-xs">
                              {latestSpec.category}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {latestSpec.renderer === 'swagger-ui' ? 'Swagger UI' : 'Redoc'}
                          </Badge>
                        </div>

                        {/* Version selector */}
                        <div className="mb-4">
                          <label className="text-xs text-muted-foreground mb-2 block">
                            Version ({versions.length} available)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {versions.map((spec) => (
                              <Link
                                key={spec.id}
                                href={`/api-specs/${spec.slug}/${spec.version}`}
                              >
                                <Badge
                                  variant={spec.id === latestSpec.id ? "default" : "secondary"}
                                  className="cursor-pointer hover:opacity-80"
                                >
                                  v{spec.version}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {latestSpec.repository && (
                          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{latestSpec.repository.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

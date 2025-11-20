import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Code2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/layout/section-header'

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
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbNavigation
              items={[
                { label: 'Home', href: '/' },
                { label: 'API Documentation', href: '/api-specs' },
              ]}
            />
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {/* Banner */}
            <SectionHeader
              icon={Code2}
              title="API Documentation"
              subtitle="Browse and explore interactive API specifications with Swagger UI and Redoc"
            />

            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {/* API Specs List */}
              <div>
                <h2 className="text-xl font-bold mb-4">Available API Specifications</h2>

                {Object.keys(groupedSpecs).length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No API specifications available
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          API specifications will appear here once repositories are synced
                        </p>
                        {session.user?.role?.toLowerCase() === 'admin' && (
                          <Link href="/admin/repositories">
                            <Button>
                              Configure Repositories
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedSpecs).map(([slug, versions]) => {
                      const latestSpec = versions[0] // Latest version (sorted desc)
                      return (
                        <Card key={slug} className="hover:border-primary transition-all cursor-pointer group h-full">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
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
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

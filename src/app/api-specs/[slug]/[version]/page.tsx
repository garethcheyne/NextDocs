import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, GitBranch, PanelLeft } from 'lucide-react'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/components/ui/badge'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { readFile } from 'fs/promises'
import path from 'path'
// @ts-ignore - Type definitions exist but may not be resolved
import * as yaml from 'js-yaml'
import { ApiSpecViewer } from '@/components/api-spec-viewer'

interface ApiDocDetailPageProps {
  params: Promise<{
    slug: string
    version: string
  }>
}

export default async function ApiDocDetailPage({ params }: ApiDocDetailPageProps) {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { slug, version } = await params

  // Find the specific API spec by slug and version
  const apiSpec = await prisma.aPISpec.findUnique({
    where: {
      slug_version: {
        slug,
        version,
      },
    },
    include: {
      repository: true,
    },
  })

  if (!apiSpec) {
    notFound()
  }

  // Get all versions of this API spec for version selector
  const allVersions = await prisma.aPISpec.findMany({
    where: {
      slug: slug,
      enabled: true,
    },
    orderBy: {
      version: 'desc',
    },
    select: {
      version: true,
    },
  })

  // Get all API specs for sidebar
  const allApiSpecs = await prisma.aPISpec.findMany({
    where: {
      enabled: true,
    },
    orderBy: [
      { slug: 'asc' },
      { version: 'desc' },
    ],
    select: {
      slug: true,
      name: true,
      category: true,
      version: true,
    },
  })

  // Parse the spec content from database
  let specObject: any = null
  try {
    // Parse YAML to JSON object
    // @ts-ignore - specContent exists but TypeScript may not recognize it yet
    specObject = yaml.load(apiSpec.specContent)
  } catch (error) {
    console.error('Error parsing spec content:', error)
  }

  const breadcrumbs = [
    { label: 'Home', href: '/', isLast: false },
    { label: 'API Specs', href: '/api-specs', isLast: false },
    { label: apiSpec.name, href: `/api-specs/${slug}`, isLast: false },
    { label: `v${version}`, href: `/api-specs/${slug}/${version}`, isLast: true },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          user={session.user} 
          currentPath={`/api-specs/${slug}/${version}`}
          apiSpecs={allApiSpecs}
        />

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
                <BreadcrumbNavigation items={breadcrumbs} />
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-12 py-6 overflow-auto">
            {/* API Info Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold">{apiSpec.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    {apiSpec.category && (
                      <Badge variant="outline" className="text-xs">
                        {apiSpec.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {apiSpec.renderer === 'swagger-ui' ? 'Swagger UI' : 'Redoc'}
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      v{version}
                    </Badge>
                  </div>
                </div>

                {/* Version Selector */}
                {allVersions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Switch version:</span>
                    <div className="flex gap-2">
                      {allVersions.map((v: { version: string }) => (
                        <Link key={v.version} href={`/api-specs/${slug}/${v.version}`}>
                          <Badge
                            variant={v.version === version ? 'default' : 'secondary'}
                            className="cursor-pointer hover:opacity-80"
                          >
                            v{v.version}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {apiSpec.description && (
                <p className="text-muted-foreground max-w-3xl">
                  {apiSpec.description}
                </p>
              )}
            </div>

            {/* API Viewer */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <ApiSpecViewer 
                spec={specObject} 
                renderer={apiSpec.renderer as 'swagger-ui' | 'redoc'} 
              />
            </div>

            {/* Footer Info */}
            <div className="mt-6 p-4 rounded-lg border bg-card/50">
              <div className="flex flex-col gap-4">
                {apiSpec.autoSync && (
                  <div className="flex items-start gap-2 text-sm">
                    <GitBranch className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Auto-Sync Enabled</p>
                      <p className="text-muted-foreground text-xs">
                        This API specification is automatically synchronized from the
                        repository every {Math.floor(apiSpec.syncFrequency / 60)} minutes.
                      </p>
                    </div>
                  </div>
                )}

                {apiSpec.repository && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Repository</p>
                      <p className="text-muted-foreground text-xs">
                        {apiSpec.repository.name}
                        {apiSpec.repository.source === 'github' && ' (GitHub)'}
                        {apiSpec.repository.source === 'azure' && ' (Azure DevOps)'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Specification Path</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {apiSpec.specPath}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

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
    { label: 'Home', href: '/' },
    { label: 'API Specs', href: '/api-specs' },
    { label: apiSpec.name, href: `/api-specs/${slug}` },
    { label: `v${version}`, href: `/api-specs/${slug}/${version}` },
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

            {/* API Viewer */}
            <ApiSpecViewer
              spec={specObject}
              renderer={apiSpec.renderer as 'swagger-ui' | 'redoc'}
            />

          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

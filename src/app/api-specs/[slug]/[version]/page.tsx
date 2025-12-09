import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, GitBranch } from 'lucide-react'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/components/ui/badge'
import { readFile } from 'fs/promises'
import path from 'path'
// @ts-ignore - Type definitions exist but may not be resolved
import * as yaml from 'js-yaml'
import { ApiSpecViewer } from '@/components/api-spec-viewer'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

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
    <ContentDetailLayout
      user={session.user}
      currentPath={`/api-specs/${slug}/${version}`}
      breadcrumbs={breadcrumbs}
      showTOC={false}
    >
      {/* API Viewer */}
      <ApiSpecViewer
        spec={specObject}
        renderer={apiSpec.renderer as 'swagger-ui' | 'redoc'}
      />
    </ContentDetailLayout>
  )
}

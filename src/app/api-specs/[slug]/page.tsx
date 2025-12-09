import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Clock } from 'lucide-react'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

interface ApiSpecVersionsPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function ApiSpecVersionsPage({ params }: ApiSpecVersionsPageProps) {
    const session = await auth()
    if (!session) {
        redirect('/')
    }

    const { slug } = await params

    // Find all versions of this API spec
    const apiSpecs = await prisma.aPISpec.findMany({
        where: {
            slug,
            enabled: true,
        },
        include: {
            repository: true,
        },
        orderBy: {
            version: 'desc', // Latest version first
        },
    })

    if (apiSpecs.length === 0) {
        notFound()
    }

    const latestSpec = apiSpecs[0]

    // Fetch all API specs for sidebar
    const allApiSpecs = await prisma.aPISpec.findMany({
        where: {
            enabled: true,
        },
        orderBy: [
            { slug: 'asc' },
            { version: 'desc' },
        ],
    })

    const sidebarApiSpecs = allApiSpecs.map(spec => ({
        slug: spec.slug,
        name: spec.name,
        category: spec.category,
        version: spec.version,
    }))

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/api-specs"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'API Specs', href: '/api-specs' },
                { label: `${latestSpec.name} Versions`, href: `/api-specs/${slug}` },
            ]}
            showTOC={false}
        >
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-10 w-10 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{latestSpec.name}</h1>
                        {latestSpec.category && (
                            <Badge variant="outline" className="mt-2">
                                {latestSpec.category}
                            </Badge>
                        )}
                    </div>
                </div>

                {latestSpec.description && (
                    <p className="text-muted-foreground text-lg max-w-3xl">
                        {latestSpec.description}
                    </p>
                )}
            </div>

            <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">Available Versions</h2>
                            <p className="text-muted-foreground mb-6">
                                Select a version to view the API specification
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {apiSpecs.map((spec, index) => (
                                <Link
                                    key={spec.id}
                                    href={`/api-specs/${spec.slug}/${spec.version}`}
                                >
                                    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-primary">
                                                        v{spec.version}
                                                    </span>
                                                    {index === 0 && (
                                                        <Badge variant="default" className="text-xs">
                                                            Latest
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {spec.renderer === 'swagger-ui' ? 'Swagger UI' : 'Redoc'}
                                                </Badge>
                                            </div>

                                            {spec.updatedAt && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        Updated {new Date(spec.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}

                                            {spec.repository && (
                                                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        <span>{spec.repository.name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {apiSpecs.length === 1 && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    This API specification currently has only one version available.
                                </p>
                            </div>
                        )})
        </ContentDetailLayout>
    )
}

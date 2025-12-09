import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { FeaturesClient } from '@/components/features/features-client'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function FeaturesPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; status?: string; sort?: string }>
}) {
    const session = await auth()
    const params = await searchParams

    if (!session) {
        redirect('/')
    }

    // Build query filters
    const where: any = {}
    if (params.category) {
        where.categoryId = params.category
    }
    if (params.status) {
        where.status = params.status
    }

    // Build sort order
    let orderBy: any = { lastActivityAt: 'desc' }
    if (params.sort === 'votes') {
        orderBy = { voteCount: 'desc' }
    } else if (params.sort === 'newest') {
        orderBy = { createdAt: 'desc' }
    } else if (params.sort === 'oldest') {
        orderBy = { createdAt: 'asc' }
    }

    // Fetch all feature requests
    const features = await prisma.featureRequest.findMany({
        where,
        include: {
            category: {
                select: {
                    name: true,
                    slug: true,
                    icon: true,
                    color: true,
                },
            },
            creator: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                },
            },
            votes: session?.user?.id ? {
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                    voteType: true,
                },
            } : false,
        },
        orderBy,
    })

    // Fetch all categories for filter
    const categories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
    })

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/features"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Feature Requests', href: '/features' },
            ]}
            showTOC={false}
            noPadding={true}
        >
            <FeaturesClient
                features={features}
                categories={categories}
                params={params}
            />
        </ContentDetailLayout>
    )
}


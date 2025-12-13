import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { FeaturesClient } from '@/components/features/features-client'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { RestrictedAccess } from '@/components/auth/restricted-access'
import { checkPageAccess } from '@/lib/auth/access-control'

export default async function FeaturesPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; status?: string; sort?: string }>
}) {
    const session = await auth()
    const params = await searchParams

    // Check access - this handles both unauthenticated and unauthorized users
    const accessCheck = checkPageAccess(session)
    
    // If not authenticated, redirect to login (middleware should handle this, but double-check)
    if (!session) {
        redirect('/login?callbackUrl=/features')
    }

    // If authenticated but no access, show restriction message
    if (!accessCheck.hasAccess) {
        return (
            <ContentDetailLayout
                user={session?.user ?? { name: null, email: null, role: null }}
                currentPath="/features"
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Feature Requests', href: '/features' },
                ]}
                showTOC={false}
            >
                <RestrictedAccess 
                    title="Access Required"
                    message={accessCheck.reason || "You don't have permission to access feature requests."}
                />
            </ContentDetailLayout>
        )
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
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                    iconBase64: true,
                    color: true,
                    integrationType: true,
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
            _count: {
                select: {
                    votes: true,
                },
            },
        },
        orderBy,
    })

    // Calculate vote counts for each feature
    const featuresWithVoteCounts = await Promise.all(
        features.map(async (feature) => {
            const voteStats = await prisma.featureVote.groupBy({
                by: ['voteType'],
                where: {
                    featureId: feature.id,
                },
                _count: {
                    voteType: true,
                },
            })

            const upvotes = voteStats.find(stat => stat.voteType === 1)?._count.voteType || 0
            const downvotes = voteStats.find(stat => stat.voteType === -1)?._count.voteType || 0

            return {
                ...feature,
                upvotes,
                downvotes,
            }
        })
    )

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
                features={featuresWithVoteCounts}
                categories={categories}
                params={params}
            />
        </ContentDetailLayout>
    )
}


import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { updateFeatureRequestSearchVector } from '@/lib/search/indexer'

// GET /api/features - List all feature requests with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const category = searchParams.get('category') // Accept 'category' instead of 'categoryId'
        const sort = searchParams.get('sort') || 'recent' // recent, votes, comments, newest, oldest
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {}
        if (status) where.status = status
        if (category) where.categoryId = category

        let orderBy: any = { lastActivityAt: 'desc' }
        if (sort === 'votes') orderBy = { voteCount: 'desc' }
        if (sort === 'comments') orderBy = { commentCount: 'desc' }
        if (sort === 'newest') orderBy = { createdAt: 'desc' }
        if (sort === 'oldest') orderBy = { createdAt: 'asc' }

        const [features, total] = await Promise.all([
            prisma.featureRequest.findMany({
                where,
                orderBy,
                take: limit,
                skip: offset,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            icon: true,
                            color: true,
                        },
                    },
                    _count: {
                        select: {
                            votes: true,
                            comments: true,
                            followers: true,
                        },
                    },
                },
            }),
            prisma.featureRequest.count({ where }),
        ])

        // Get user's vote status for each feature
        const featureIds = features.map((f) => f.id)
        const userVotes = await prisma.featureVote.findMany({
            where: {
                featureId: { in: featureIds },
                userId: session.user.id,
            },
            select: {
                featureId: true,
                voteType: true,
            },
        })

        const voteMap = new Map(userVotes.map((v) => [v.featureId, v.voteType]))

        const enrichedFeatures = features.map((feature) => ({
            ...feature,
            userVote: voteMap.get(feature.id) || null,
        }))

        return NextResponse.json({
            features: enrichedFeatures,
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Error fetching features:', error)
        return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 })
    }
}

// POST /api/features - Create new feature request
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, categoryId, tags, slug } = body

        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            )
        }

        // Use provided slug or generate one
        const finalSlug = slug || (
            title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
                + '-' + Date.now()
        )

        // Create feature request
        const feature = await prisma.featureRequest.create({
            data: {
                title,
                slug: finalSlug,
                description,
                categoryId: categoryId || null,
                tags: tags || [],
                createdBy: session.user.id,
                createdByName: session.user.name || session.user.email || 'Unknown',
                createdByEmail: session.user.email || '',
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true,
                        color: true,
                    },
                },
            },
        })

        // Auto-follow the feature
        await prisma.featureFollower.create({
            data: {
                featureId: feature.id,
                userId: session.user.id,
            },
        })

        // Update search vector
        await updateFeatureRequestSearchVector(feature.id)

        // TODO: Queue email notification to admins

        return NextResponse.json({ feature }, { status: 201 })
    } catch (error) {
        console.error('Error creating feature:', error)
        return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 })
    }
}

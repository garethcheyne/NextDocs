import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { updateFeatureRequestSearchVector } from '@/lib/search/indexer'

// GET /api/features/[id] - Get single feature request
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const feature = await prisma.featureRequest.findUnique({
            where: { id: params.id },
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
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
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
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Get user's vote and follow status
        const [userVote, userFollowing] = await Promise.all([
            prisma.featureVote.findUnique({
                where: {
                    featureId_userId: {
                        featureId: params.id,
                        userId: session.user.id,
                    },
                },
            }),
            prisma.featureFollower.findUnique({
                where: {
                    featureId_userId: {
                        featureId: params.id,
                        userId: session.user.id,
                    },
                },
            }),
        ])

        return NextResponse.json({
            ...feature,
            userVote: userVote?.voteType || null,
            isFollowing: !!userFollowing,
        })
    } catch (error) {
        console.error('Error fetching feature:', error)
        return NextResponse.json({ error: 'Failed to fetch feature' }, { status: 500 })
    }
}

// PUT /api/features/[id] - Update feature request
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const feature = await prisma.featureRequest.findUnique({
            where: { id: params.id },
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Check if user is creator or admin
        const isCreator = feature.createdBy === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isCreator && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { title, description, categoryId, tags, priority, targetVersion, attachments } = body

        const updated = await prisma.featureRequest.update({
            where: { id: params.id },
            data: {
                title,
                description,
                categoryId,
                tags,
                priority,
                targetVersion,
                attachments,
                updatedAt: new Date(),
                lastActivityAt: new Date(),
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

        // Update search vector
        await updateFeatureRequestSearchVector(updated.id)

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating feature:', error)
        return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 })
    }
}

// DELETE /api/features/[id] - Delete feature request
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const feature = await prisma.featureRequest.findUnique({
            where: { id: params.id },
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Check if user is creator or admin
        const isCreator = feature.createdBy === session.user.id
        const isAdmin = session.user.role === 'admin'

        if (!isCreator && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.featureRequest.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting feature:', error)
        return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 })
    }
}

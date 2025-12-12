import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: featureId } = await params
    const session = await auth()

    // Verify authentication
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const feature = await prisma.featureRequest.findUnique({
            where: { id: featureId },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, image: true },
                },
                category: true,
                votes: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
                comments: {
                    include: {
                        user: { select: { id: true, name: true, email: true, image: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
                internalNotes: {
                    include: {
                        creator: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Format for export
        const exportData = {
            id: feature.id,
            title: feature.title,
            slug: feature.slug,
            description: feature.description,
            status: feature.status,
            priority: feature.priority,
            isPinned: feature.isPinned,
            isArchived: feature.isArchived,
            commentsLocked: feature.commentsLocked,
            creator: feature.creator,
            category: feature.category,
            targetVersion: feature.targetVersion,
            expectedDate: feature.expectedDate,
            voteCount: feature.voteCount,
            votes: {
                upvotes: feature.votes.filter(v => v.voteType === 1).length,
                downvotes: feature.votes.filter(v => v.voteType === -1).length,
                voters: feature.votes.map(v => ({
                    user: v.user?.name,
                    type: v.voteType === 1 ? 'upvote' : 'downvote',
                    date: v.createdAt,
                })),
            },
            comments: feature.comments.map(c => ({
                id: c.id,
                author: c.user?.name,
                content: c.content,
                createdAt: c.createdAt,
            })),
            statusHistory: feature.statusHistory.map(h => ({
                status: h.newStatus,
                reason: h.reason,
                date: h.createdAt,
            })),
            internalNotes: feature.internalNotes.map(n => ({
                author: n.creator?.name,
                content: n.content,
                date: n.createdAt,
            })),
            createdAt: feature.createdAt,
            updatedAt: feature.updatedAt,
            exportedAt: new Date().toISOString(),
        }

        return NextResponse.json(exportData)
    } catch (error) {
        console.error('Error exporting feature:', error)
        return NextResponse.json({ error: 'Failed to export feature' }, { status: 500 })
    }
}

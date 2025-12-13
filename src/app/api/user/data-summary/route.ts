import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                createdAt: true,
            },
        })

        // Get user's feature request count
        const totalFeatures = await prisma.featureRequest.count({
            where: {
                createdBy: session.user.id,
            },
        })

        // Get user's comment count
        const totalComments = await prisma.featureComment.count({
            where: {
                userId: session.user.id,
            },
        })

        // Get user's likes count
        const totalLikes = await prisma.featureVote.count({
            where: {
                userId: session.user.id,
                voteType: 1,
            },
        })

        // Get last login (from analytics sessions)
        const lastSession = await prisma.analyticsSession.findFirst({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                startedAt: 'desc',
            },
            select: {
                startedAt: true,
            },
        })

        return NextResponse.json({
            createdAt: user?.createdAt?.toISOString() || null,
            totalFeatures,
            totalComments,
            totalLikes,
            lastLogin: lastSession?.startedAt?.toISOString() || null,
        })

    } catch (error) {
        console.error('Error fetching user data summary:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user data summary' },
            { status: 500 }
        )
    }
}
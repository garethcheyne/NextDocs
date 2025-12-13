import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all user data for export
        const userData = {
            user: await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    id: true,
                    name: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    emailNotifications: true,
                    notifyOnFeatureStatusChange: true,
                    notifyOnFeatureComment: true,
                    notifyOnNewFeature: true,
                    notifyOnFeatureVote: true,
                },
            }),
            featureRequests: await prisma.featureRequest.findMany({
                where: { createdBy: session.user.id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            comments: await prisma.featureComment.findMany({
                where: { userId: session.user.id },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    feature: {
                        select: {
                            title: true,
                            slug: true,
                        },
                    },
                },
            }),
            votes: await prisma.featureVote.findMany({
                where: { userId: session.user.id },
                select: {
                    id: true,
                    voteType: true,
                    createdAt: true,
                    feature: {
                        select: {
                            title: true,
                            slug: true,
                        },
                    },
                },
            }),
            followers: await prisma.featureFollower.findMany({
                where: { userId: session.user.id },
                select: {
                    id: true,
                    createdAt: true,
                    feature: {
                        select: {
                            title: true,
                            slug: true,
                        },
                    },
                },
            }),
            exportedAt: new Date().toISOString(),
            exportedBy: session.user.email,
        }

        const fileName = `user-data-${session.user.id}-${new Date().toISOString().split('T')[0]}.json`

        return new NextResponse(JSON.stringify(userData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        })

    } catch (error) {
        console.error('Error exporting user data:', error)
        return NextResponse.json(
            { error: 'Failed to export user data' },
            { status: 500 }
        )
    }
}
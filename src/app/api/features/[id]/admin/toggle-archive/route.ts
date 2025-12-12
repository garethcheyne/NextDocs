import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: featureId } = await params
    const session = await auth()

    // Verify admin role
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const feature = await prisma.featureRequest.findUnique({
            where: { id: featureId },
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Toggle archive status
        const updated = await prisma.featureRequest.update({
            where: { id: featureId },
            data: { isArchived: !feature.isArchived },
        })

        return NextResponse.json({ success: true, isArchived: updated.isArchived })
    } catch (error) {
        console.error('Error toggling archive:', error)
        return NextResponse.json({ error: 'Failed to toggle archive' }, { status: 500 })
    }
}

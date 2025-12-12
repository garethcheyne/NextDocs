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

        // Toggle pin status
        const updated = await prisma.featureRequest.update({
            where: { id: featureId },
            data: { isPinned: !feature.isPinned },
        })

        return NextResponse.json({ success: true, isPinned: updated.isPinned })
    } catch (error) {
        console.error('Error toggling pin:', error)
        return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 })
    }
}

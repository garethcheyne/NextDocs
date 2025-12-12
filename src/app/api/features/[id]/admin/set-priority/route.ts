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
        const { priority } = await req.json()

        if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
            return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
        }

        const updated = await prisma.featureRequest.update({
            where: { id: featureId },
            data: { priority },
        })

        return NextResponse.json({ success: true, priority: updated.priority })
    } catch (error) {
        console.error('Error setting priority:', error)
        return NextResponse.json({ error: 'Failed to set priority' }, { status: 500 })
    }
}

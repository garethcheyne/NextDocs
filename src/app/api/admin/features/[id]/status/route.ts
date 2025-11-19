import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { notifyFeatureStatusChange } from '@/lib/email/notification-service'

// POST /api/admin/features/[id]/status - Update feature request status
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        
        // Check if user is admin
        if (!session?.user?.role || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params
        const body = await request.json()
        const { status, reason } = body

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            )
        }

        // Validate status
        const validStatuses = ['proposal', 'approved', 'declined', 'in-progress', 'completed', 'on-hold']
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            )
        }

        // Get current feature
        const feature = await prisma.featureRequest.findUnique({
            where: { id },
            select: { status: true, slug: true },
        })

        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }

        // Don't update if status is the same
        if (feature.status === status) {
            return NextResponse.json(
                { error: 'Status is already set to ' + status },
                { status: 400 }
            )
        }

        // Update feature status
        const updatedFeature = await prisma.featureRequest.update({
            where: { id },
            data: {
                status,
                lastActivityAt: new Date(),
            },
        })

        // Create status history record
        await prisma.featureStatusHistory.create({
            data: {
                featureId: id,
                oldStatus: feature.status,
                newStatus: status,
                reason: reason || null,
                changedBy: session.user.id,
            },
        })

        // Send email notifications to followers
        notifyFeatureStatusChange(
            id,
            feature.status,
            status,
            reason,
            session.user.id
        ).catch((error) => {
            console.error('Failed to send status change notifications:', error)
            // Don't fail the request if email fails
        })

        return NextResponse.json({
            feature: updatedFeature,
            message: 'Status updated successfully',
        })
    } catch (error) {
        console.error('Error updating feature status:', error)
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        )
    }
}

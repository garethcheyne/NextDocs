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
        const { content } = await req.json()

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
        }

        const note = await prisma.featureInternalNote.create({
            data: {
                featureId,
                content: content.trim(),
                createdBy: session.user.id,
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        return NextResponse.json({ success: true, note })
    } catch (error) {
        console.error('Error adding internal note:', error)
        return NextResponse.json({ error: 'Failed to add internal note' }, { status: 500 })
    }
}

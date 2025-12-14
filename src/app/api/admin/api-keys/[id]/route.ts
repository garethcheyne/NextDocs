import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// PATCH /api/admin/api-keys/[id] - Update an API key (only isActive can be changed)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { isActive } = body

        if (typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
        }

        const resolvedParams = await params

        // Verify the API key belongs to the authenticated admin
        const existingKey = await prisma.aPIKey.findFirst({
            where: {
                id: resolvedParams.id,
                createdById: session.user.id
            }
        })

        if (!existingKey) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }

        // Update the API key
        const updatedKey = await prisma.aPIKey.update({
            where: {
                id: resolvedParams.id
            },
            data: {
                isActive,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                description: true,
                keyPreview: true,
                permissions: true,
                expiresAt: true,
                lastUsedAt: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return NextResponse.json(updatedKey)
    } catch (error) {
        console.error('Error updating API key:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/admin/api-keys/[id] - Delete an API key
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params

        // Verify the API key belongs to the authenticated admin
        const existingKey = await prisma.aPIKey.findFirst({
            where: {
                id: resolvedParams.id,
                createdById: session.user.id
            }
        })

        if (!existingKey) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }

        // Delete the API key
        await prisma.aPIKey.delete({
            where: {
                id: resolvedParams.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting API key:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        const resolvedParams = await params

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { role, active, firstName, lastName } = body

        if (role && !['user', 'editor', 'admin'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Prevent admin from disabling themselves
        if (session.user.id === resolvedParams.id && active === false) {
            return NextResponse.json(
                { error: 'You cannot disable your own account' },
                { status: 400 }
            )
        }

        // Prevent admin from removing their own admin role
        if (session.user.id === resolvedParams.id && role && role !== 'admin') {
            return NextResponse.json(
                { error: 'You cannot change your own role' },
                { status: 400 }
            )
        }

        const updateData: any = {}
        if (role !== undefined) updateData.role = role
        if (active !== undefined) updateData.active = active
        if (firstName !== undefined) updateData.firstName = firstName
        if (lastName !== undefined) updateData.lastName = lastName
        
        // Auto-compute name from firstName and lastName
        if (firstName !== undefined || lastName !== undefined) {
            const user = await prisma.user.findUnique({ where: { id: resolvedParams.id } })
            const newFirstName = firstName !== undefined ? firstName : user?.firstName
            const newLastName = lastName !== undefined ? lastName : user?.lastName
            updateData.name = [newFirstName, newLastName].filter(Boolean).join(' ') || null
        }

        const user = await prisma.user.update({
            where: {
                id: resolvedParams.id,
            },
            data: updateData,
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        const resolvedParams = await params

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Prevent admin from deleting themselves
        if (session.user.id === resolvedParams.id) {
            return NextResponse.json(
                { error: 'You cannot delete your own account' },
                { status: 400 }
            )
        }

        // Delete user
        await prisma.user.delete({
            where: {
                id: resolvedParams.id,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}


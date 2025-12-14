import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { generateAPIKey, hashAPIKey, createAPIKeyPreview } from '@/lib/api-keys/utils'

// GET /api/admin/api-keys - List all API keys for the authenticated admin
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const apiKeys = await prisma.aPIKey.findMany({
            where: {
                createdById: session.user.id
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(apiKeys)
    } catch (error) {
        console.error('Error fetching API keys:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/admin/api-keys - Create a new API key
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, permissions, expiresAt } = body

        // Validate required fields
        if (!name || !expiresAt) {
            return NextResponse.json({ error: 'Name and expiry date are required' }, { status: 400 })
        }

        // Validate permissions
        if (!['read', 'write'].includes(permissions)) {
            return NextResponse.json({ error: 'Invalid permissions' }, { status: 400 })
        }

        // Validate expiry date is in the future
        const expiryDate = new Date(expiresAt)
        if (expiryDate <= new Date()) {
            return NextResponse.json({ error: 'Expiry date must be in the future' }, { status: 400 })
        }

        // Generate the API key
        const rawKey = generateAPIKey()
        const keyHash = hashAPIKey(rawKey)
        const keyPreview = createAPIKeyPreview(rawKey)

        // Create the API key in database
        const apiKey = await prisma.aPIKey.create({
            data: {
                name,
                description,
                keyHash,
                keyPreview,
                permissions,
                expiresAt: expiryDate,
                createdById: session.user.id
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

        // Return the created API key with the raw key (only shown once)
        return NextResponse.json({
            ...apiKey,
            key: rawKey // Only returned on creation
        })
    } catch (error) {
        console.error('Error creating API key:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
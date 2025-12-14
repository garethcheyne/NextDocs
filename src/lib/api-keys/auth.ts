import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashAPIKey, isAPIKeyExpired } from '@/lib/api-keys/utils'

export interface APIAuthResult {
    success: boolean
    user?: {
        id: string
        email: string
        name: string | null
        role: string
    }
    permissions?: 'read' | 'write'
    error?: string
}

/**
 * Authenticate a request using either OAuth session or API key
 */
export async function authenticateRequest(request: NextRequest): Promise<APIAuthResult> {
    // Check for API key in Authorization header
    const authHeader = request.headers.get('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
        return await authenticateAPIKey(apiKey)
    }

    // Check for API key in X-API-Key header
    const apiKeyHeader = request.headers.get('x-api-key')
    if (apiKeyHeader) {
        return await authenticateAPIKey(apiKeyHeader)
    }

    // If no API key, fall back to OAuth session authentication
    return { success: false, error: 'No authentication provided' }
}

/**
 * Validate an API key and return user information
 */
async function authenticateAPIKey(apiKey: string): Promise<APIAuthResult> {
    try {
        // Validate API key format (should be 64 hex characters)
        if (!/^[a-f0-9]{64}$/i.test(apiKey)) {
            return { success: false, error: 'Invalid API key format' }
        }

        // Hash the provided key to compare with stored hash
        const keyHash = hashAPIKey(apiKey)

        // Find the API key in database
        const dbApiKey = await prisma.aPIKey.findUnique({
            where: {
                keyHash: keyHash
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        active: true
                    }
                }
            }
        })

        if (!dbApiKey) {
            return { success: false, error: 'Invalid API key' }
        }

        // Check if API key is active
        if (!dbApiKey.isActive) {
            return { success: false, error: 'API key is inactive' }
        }

        // Check if API key is expired
        if (isAPIKeyExpired(dbApiKey.expiresAt)) {
            return { success: false, error: 'API key has expired' }
        }

        // Check if the user who created the key is still active
        if (!dbApiKey.createdBy.active) {
            return { success: false, error: 'User account is inactive' }
        }

        // Update last used timestamp (fire and forget)
        updateLastUsed(dbApiKey.id).catch(error => {
            console.warn('Failed to update API key last used timestamp:', error)
        })

        return {
            success: true,
            user: {
                id: dbApiKey.createdBy.id,
                email: dbApiKey.createdBy.email,
                name: dbApiKey.createdBy.name,
                role: dbApiKey.createdBy.role
            },
            permissions: dbApiKey.permissions as 'read' | 'write'
        }
    } catch (error) {
        console.error('Error authenticating API key:', error)
        return { success: false, error: 'Authentication failed' }
    }
}

/**
 * Update the last used timestamp for an API key
 */
async function updateLastUsed(apiKeyId: string): Promise<void> {
    await prisma.aPIKey.update({
        where: {
            id: apiKeyId
        },
        data: {
            lastUsedAt: new Date()
        }
    })
}

/**
 * Check if the authenticated user has the required permissions
 */
export function hasPermission(permissions: 'read' | 'write', required: 'read' | 'write'): boolean {
    if (required === 'read') {
        return true // Both read and write permissions allow reading
    }

    if (required === 'write') {
        return permissions === 'write' // Only write permissions allow writing
    }

    return false
}

/**
 * Get user from session (fallback for non-API key authentication)
 */
export async function getUserFromSession(): Promise<APIAuthResult> {
    try {
        // Import auth here to avoid circular dependencies
        const { auth } = await import('@/lib/auth/auth')
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: 'No active session' }
        }

        return {
            success: true,
            user: {
                id: session.user.id!,
                email: session.user.email!,
                name: session.user.name ?? null,
                role: session.user.role!
            },
            permissions: 'write' // Session users have full access
        }
    } catch (error) {
        console.error('Error getting user from session:', error)
        return { success: false, error: 'Session authentication failed' }
    }
}
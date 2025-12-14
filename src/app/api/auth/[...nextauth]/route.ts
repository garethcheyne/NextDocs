import { handlers } from '@/lib/auth/auth'
import { NextRequest } from 'next/server'
import {
    checkRateLimit,
    rateLimitResponse,
    clearRateLimit,
    AUTH_RATE_LIMIT,
} from '@/lib/security/rate-limiter'

export const { GET } = handlers

/**
 * Custom POST handler with rate limiting for credentials authentication
 */
export async function POST(request: NextRequest) {
    const url = new URL(request.url)
    const isCredentialsCallback = url.pathname.includes('/callback/credentials')

    // Only rate limit credentials authentication
    if (isCredentialsCallback) {
        // Get IP address for rate limiting
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown'

        // Check rate limit
        const rateLimitResult = await checkRateLimit(ip, AUTH_RATE_LIMIT)

        if (!rateLimitResult.success) {
            console.warn(`Rate limit exceeded for IP: ${ip}`)
            return rateLimitResponse(rateLimitResult)
        }
    }

    // Delegate to NextAuth handler
    return handlers.POST(request)
}

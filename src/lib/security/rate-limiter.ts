import { getRedisClient } from '@/lib/redis'
import { NextResponse } from 'next/server'

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number
    /** Time window in seconds */
    windowSeconds: number
    /** Key prefix for Redis */
    keyPrefix: string
    /** Optional: Block duration in seconds after limit exceeded (default: same as windowSeconds) */
    blockDurationSeconds?: number
}

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetAt: Date
    blocked: boolean
}

/**
 * Check rate limit for a given identifier (e.g., IP address, user ID)
 * Uses a sliding window counter algorithm
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const redis = getRedisClient()
    const key = `${config.keyPrefix}:${identifier}`
    const blockKey = `${config.keyPrefix}:blocked:${identifier}`
    const now = Date.now()
    const windowMs = config.windowSeconds * 1000

    try {
        // Check if identifier is blocked
        const blocked = await redis.get(blockKey)
        if (blocked) {
            const ttl = await redis.ttl(blockKey)
            return {
                success: false,
                remaining: 0,
                resetAt: new Date(now + ttl * 1000),
                blocked: true,
            }
        }

        // Get current count
        const current = await redis.get(key)
        const count = current ? parseInt(current, 10) : 0

        if (count >= config.maxRequests) {
            // Rate limit exceeded - block the identifier
            const blockDuration = config.blockDurationSeconds || config.windowSeconds
            await redis.setex(blockKey, blockDuration, '1')

            return {
                success: false,
                remaining: 0,
                resetAt: new Date(now + blockDuration * 1000),
                blocked: true,
            }
        }

        // Increment counter
        const pipeline = redis.pipeline()
        pipeline.incr(key)
        pipeline.expire(key, config.windowSeconds)
        await pipeline.exec()

        const ttl = await redis.ttl(key)

        return {
            success: true,
            remaining: config.maxRequests - count - 1,
            resetAt: new Date(now + ttl * 1000),
            blocked: false,
        }
    } catch (error) {
        console.error('Rate limit check error:', error)
        // On error, allow the request to proceed (fail open)
        return {
            success: true,
            remaining: config.maxRequests,
            resetAt: new Date(now + windowMs),
            blocked: false,
        }
    }
}

/**
 * Create a rate limit error response with appropriate headers
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
    const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)

    return NextResponse.json(
        {
            error: 'Too many requests. Please try again later.',
            retryAfter,
        },
        {
            status: 429,
            headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.resetAt.toISOString(),
            },
        }
    )
}

/**
 * Clear rate limit for an identifier (e.g., after successful login)
 */
export async function clearRateLimit(
    identifier: string,
    keyPrefix: string
): Promise<void> {
    const redis = getRedisClient()
    const key = `${keyPrefix}:${identifier}`
    const blockKey = `${keyPrefix}:blocked:${identifier}`

    try {
        await redis.del(key, blockKey)
    } catch (error) {
        console.error('Clear rate limit error:', error)
    }
}

// Pre-configured rate limiters for common use cases
export const AUTH_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 5,           // 5 attempts
    windowSeconds: 60,        // per minute
    keyPrefix: 'ratelimit:auth',
    blockDurationSeconds: 300, // 5 minute block after exceeding
}

export const API_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 100,         // 100 requests
    windowSeconds: 60,        // per minute
    keyPrefix: 'ratelimit:api',
}

export const PASSWORD_RESET_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 3,           // 3 attempts
    windowSeconds: 3600,      // per hour
    keyPrefix: 'ratelimit:password-reset',
    blockDurationSeconds: 3600, // 1 hour block
}

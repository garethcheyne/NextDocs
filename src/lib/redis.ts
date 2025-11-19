// lib/redis.ts
import Redis from 'ioredis'

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  
  // Fallback for local development
  return 'redis://localhost:6379'
}

// Create Redis client singleton
const createRedisClient = () => {
  const client = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    lazyConnect: true,
  })

  client.on('error', (error) => {
    console.error('Redis Client Error:', error)
  })

  client.on('connect', () => {
    console.log('✓ Redis connected')
  })

  return client
}

// Singleton instance
let redis: Redis | null = null

export const getRedisClient = () => {
  if (!redis) {
    redis = createRedisClient()
  }
  return redis
}

// Helper functions for caching
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient()
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error)
    return null
  }
}

export const cacheSet = async (
  key: string,
  value: any,
  expirySeconds: number = 3600
): Promise<void> => {
  try {
    const client = getRedisClient()
    await client.setex(key, expirySeconds, JSON.stringify(value))
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error)
  }
}

export const cacheDel = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error)
  }
}

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient()
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (error) {
    console.error(`Redis DEL pattern error for ${pattern}:`, error)
  }
}

export default getRedisClient

// lib/redis.ts
import Redis from 'ioredis'

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  
  // Fallback for local development
  return 'redis://localhost:6379'
}

// Parse Redis URL to extract connection details
const getRedisConfig = () => {
  const url = getRedisUrl()
  
  try {
    const parsedUrl = new URL(url)
    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || '6379'),
      password: parsedUrl.password || undefined,
    }
  } catch {
    // Fallback for invalid URLs
    return {
      host: 'localhost',
      port: 6379,
    }
  }
}

// Create Redis client singleton
const createRedisClient = () => {
  const config = getRedisConfig()
  const client = new Redis({
    ...config,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

  client.on('error', (error) => {
    console.error('❌ Redis connection failed:', error)
  })

  client.on('connect', () => {
    console.log('🚀 Redis connection established successfully')
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

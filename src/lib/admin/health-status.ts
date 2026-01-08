// src/lib/admin/health-status.ts
import { prisma } from '@/lib/db/prisma'
import { getRedisClient } from '@/lib/redis'

export interface HealthCheckResult {
  service: string
  status: 'UP' | 'DOWN' | 'WARNING'
  message: string
  details?: any
  timestamp: string
}

export async function getSystemHealthStatus(): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = []
  const timestamp = new Date().toISOString()

  // Database Health Check
  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = `${Date.now() - startTime}ms`
    
    // Get database version and stats
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`
    const version = versionResult[0]?.version?.match(/PostgreSQL ([\d.]+)/)?.[1] || 'Unknown'
    
    // Get database size
    const sizeResult = await prisma.$queryRaw<Array<{ size: string }>>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `
    const databaseSize = sizeResult[0]?.size || 'Unknown'
    
    // Get connection stats
    const connResult = await prisma.$queryRaw<Array<{ count: number, max: number }>>`
      SELECT count(*) as count, 
             (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `
    const connections = `${connResult[0]?.count || 0} / ${connResult[0]?.max || 100}`
    
    // Get cache hit ratio
    const cacheResult = await prisma.$queryRaw<Array<{ ratio: number }>>`
      SELECT round(
        100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2
      ) as ratio
      FROM pg_stat_database
      WHERE datname = current_database()
    `
    const cacheHitRatio = `${cacheResult[0]?.ratio || 0}%`
    
    results.push({
      service: 'Database',
      status: 'UP',
      message: `PostgreSQL ${version}`,
      details: { 
        response_time: responseTime,
        version: version,
        database_size: databaseSize,
        connections: connections,
        cache_hit_ratio: cacheHitRatio
      },
      timestamp
    })
  } catch (error) {
    results.push({
      service: 'Database',
      status: 'DOWN',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    })
  }

  // Redis Health Check
  try {
    const redis = getRedisClient()
    const startTime = Date.now()
    await redis.ping()
    const responseTime = `${Date.now() - startTime}ms`
    
    // Get Redis info
    const info = await redis.info()
    const infoLines = info.split('\r\n')
    
    // Parse version
    const versionLine = infoLines.find(line => line.startsWith('redis_version:'))
    const version = versionLine?.split(':')[1] || 'Unknown'
    
    // Parse memory
    const memoryUsedLine = infoLines.find(line => line.startsWith('used_memory_human:'))
    const memoryUsed = memoryUsedLine?.split(':')[1] || 'Unknown'
    
    const memoryMaxLine = infoLines.find(line => line.startsWith('maxmemory_human:'))
    const memoryMax = memoryMaxLine?.split(':')[1] || 'Unknown'
    
    // Get stats
    const dbInfo = await redis.info('stats')
    const dbLines = dbInfo.split('\r\n')
    
    const hitsLine = dbLines.find(line => line.startsWith('keyspace_hits:'))
    const hits = parseInt(hitsLine?.split(':')[1] || '0')
    
    const missesLine = dbLines.find(line => line.startsWith('keyspace_misses:'))
    const misses = parseInt(missesLine?.split(':')[1] || '0')
    
    const hitRate = hits + misses > 0 ? `${((hits / (hits + misses)) * 100).toFixed(1)}%` : '0%'
    const cacheStats = `${hits} hits / ${misses} misses`
    
    // Get keys count
    const dbKeys = await redis.dbsize()
    
    // Get uptime
    const uptimeLine = infoLines.find(line => line.startsWith('uptime_in_days:'))
    const uptime = `${uptimeLine?.split(':')[1] || '0'} days`
    
    results.push({
      service: 'Redis',
      status: 'UP',
      message: `Redis ${version}`,
      details: { 
        response_time: responseTime,
        version: version,
        memory_used: memoryUsed,
        memory_max: memoryMax,
        cached_keys: dbKeys,
        hit_rate: hitRate,
        uptime: uptime,
        cache_stats: cacheStats
      },
      timestamp
    })
  } catch (error) {
    results.push({
      service: 'Redis',
      status: 'DOWN',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    })
  }

  // Backup Service Health Check
  try {
    const fs = require('fs')
    const path = require('path')
    
    const backupDirEnv = process.env.BACKUP_DIR || './backups'
    const backupDir = path.isAbsolute(backupDirEnv) 
      ? backupDirEnv 
      : path.join(process.cwd(), backupDirEnv)
    
    console.log(`🔍 [HEALTH] Checking backup directory: ${backupDir}`)
    console.log(`🔍 [HEALTH] BACKUP_DIR env var: ${process.env.BACKUP_DIR}`)
    console.log(`🔍 [HEALTH] Is absolute path: ${path.isAbsolute(backupDirEnv)}`)
    
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter((file: string) => file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      
      if (files.length > 0) {
        const latestFile = files
          .map((file: string) => ({
            name: file,
            stats: fs.statSync(path.join(backupDir, file))
          }))
          .sort((a: any, b: any) => b.stats.mtime.getTime() - a.stats.mtime.getTime())[0]
        
        const hoursOld = (Date.now() - latestFile.stats.mtime.getTime()) / (1000 * 60 * 60)
        
        results.push({
          service: 'Backup Service',
          status: hoursOld > 25 ? 'WARNING' : 'UP',
          message: hoursOld > 25 ? `Latest backup is ${hoursOld.toFixed(1)} hours old` : `${files.length} backups available`,
          details: { 
            backup_count: files.length, 
            latest_backup: latestFile.name,
            hours_old: hoursOld.toFixed(1)
          },
          timestamp
        })
      } else {
        results.push({
          service: 'Backup Service',
          status: 'WARNING',
          message: 'No backup files found',
          details: { backup_directory: backupDir },
          timestamp
        })
      }
    } else {
      results.push({
        service: 'Backup Service',
        status: 'DOWN',
        message: `Backup directory not found: ${backupDir}`,
        timestamp
      })
    }
  } catch (error) {
    results.push({
      service: 'Backup Service',
      status: 'DOWN',
      message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    })
  }

  // Sync Service Health Check
  try {
    const repoCount = await prisma.repository.count({ where: { enabled: true } })
    const recentSyncs = await prisma.syncLog.count({
      where: {
        startedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
    
    results.push({
      service: 'Sync Service',
      status: 'UP',
      message: `Monitoring ${repoCount} repositories`,
      details: { 
        enabled_repositories: repoCount,
        syncs_last_24h: recentSyncs
      },
      timestamp
    })
  } catch (error) {
    results.push({
      service: 'Sync Service',
      status: 'DOWN',
      message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    })
  }

  // System Resources Check
  try {
    const os = require('os')
    
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(1)
    
    const formatBytes = (bytes: number) => {
      const gb = bytes / (1024 ** 3)
      return `${gb.toFixed(2)} GB`
    }
    
    const uptimeSeconds = os.uptime()
    const days = Math.floor(uptimeSeconds / 86400)
    const hours = Math.floor((uptimeSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const systemUptime = `${days}d ${hours}h ${minutes}m`
    
    results.push({
      service: 'System Resources',
      status: parseFloat(memoryUsagePercent) > 90 ? 'WARNING' : 'UP',
      message: `${os.hostname()}`,
      details: {
        hostname: os.hostname(),
        platform: `${os.platform()} ${os.arch()}`,
        cpu_cores: os.cpus().length,
        memory_usage: `${formatBytes(usedMemory)} / ${formatBytes(totalMemory)}`,
        memory_percent: `${memoryUsagePercent}%`,
        system_uptime: systemUptime
      },
      timestamp
    })
  } catch (error) {
    results.push({
      service: 'System Resources',
      status: 'DOWN',
      message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    })
  }

  // Application Check
  try {
    const formatBytes = (bytes: number) => {
      const mb = bytes / (1024 ** 2)
      return `${mb.toFixed(2)} MB`
    }
    
    const memoryUsage = process.memoryUsage()
    const uptimeSeconds = process.uptime()
    const days = Math.floor(uptimeSeconds / 86400)
    const hours = Math.floor((uptimeSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const processUptime = days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`
    
    results.push({
      service: 'Application',
      status: 'UP',
      message: `Node.js ${process.version}`,
      details: {
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        process_uptime: processUptime,
        process_id: process.pid,
        heap_used: formatBytes(memoryUsage.heapUsed),
        total_memory: formatBytes(memoryUsage.rss)
      },
      timestamp
    })
  } catch (error) {
    results.push({
      service: 'Application',
      status: 'DOWN',
      message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    })
  }

  return results
}
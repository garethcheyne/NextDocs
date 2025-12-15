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
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()
    const repoCount = await prisma.repository.count()
    
    results.push({
      service: 'Database',
      status: 'UP',
      message: `Connected successfully`,
      details: { users: userCount, repositories: repoCount },
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
    await redis.ping()
    const info = await redis.info('memory')
    
    results.push({
      service: 'Redis',
      status: 'UP',
      message: 'Connected successfully',
      details: { memory_info: info.split('\n').find(line => line.startsWith('used_memory_human')) },
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

  return results
}
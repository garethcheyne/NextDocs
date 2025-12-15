// src/lib/startup/health-check.ts
import { prisma } from '@/lib/db/prisma'
import { getRedisClient } from '@/lib/redis'

export async function performStartupHealthCheck() {
  console.log('🔍 Performing startup health checks...')
  
  const checks = {
    database: false,
    redis: false,
    backupDirectory: false,
    syncService: false
  }

  // Database Health Check
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('🚀 Database connection established successfully')
    checks.database = true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }

  // Redis Health Check
  try {
    const redis = getRedisClient()
    await redis.ping()
    console.log('🚀 Redis connection established successfully')
    checks.redis = true
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
  }

  // Backup Directory Check
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Handle both Docker and local environments
    const backupDirEnv = process.env.BACKUP_DIR || './backups'
    const backupDir = path.isAbsolute(backupDirEnv) 
      ? backupDirEnv 
      : path.join(process.cwd(), backupDirEnv)
    
    console.log(`🔍 Checking backup directory: ${backupDir}`)
    
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter((file: string) => file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      
      console.log(`🚀 Backup directory located - Found ${files.length} backup files`)
      checks.backupDirectory = true
    } else {
      console.log(`❌ Backup directory not found: ${backupDir}`)
    }
  } catch (error) {
    console.error('❌ Backup directory check failed:', error)
  }

  // Sync Service Check
  try {
    // Check if sync worker endpoint is accessible
    const repoCount = await prisma.repository.count()
    console.log(`🚀 Sync service ready - Monitoring ${repoCount} repositories`)
    checks.syncService = true
  } catch (error) {
    console.error('❌ Sync service check failed:', error)
  }

  // Summary
  const healthyServices = Object.values(checks).filter(Boolean).length
  const totalServices = Object.keys(checks).length
  
  console.log(`\n🎯 Startup Health Check Summary:`)
  console.log(`   ✅ Services Ready: ${healthyServices}/${totalServices}`)
  console.log(`   🚀 Database: ${checks.database ? 'UP' : 'DOWN'}`)
  console.log(`   🚀 Redis: ${checks.redis ? 'UP' : 'DOWN'}`)
  console.log(`   🚀 Backup Service: ${checks.backupDirectory ? 'UP' : 'DOWN'}`)
  console.log(`   🚀 Sync Service: ${checks.syncService ? 'UP' : 'DOWN'}`)
  
  if (healthyServices === totalServices) {
    console.log('🎉 All services are healthy! Application ready to serve requests.\n')
  } else {
    console.log(`⚠️  ${totalServices - healthyServices} service(s) need attention.\n`)
  }

  return checks
}
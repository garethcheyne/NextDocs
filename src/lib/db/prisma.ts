import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Database connection and startup health check
let hasRunHealthCheck = false
prisma.$connect().then(async () => {
  console.log('🚀 Database connection established successfully')
  
  // Run full health check once when database connects
  if (!hasRunHealthCheck) {
    hasRunHealthCheck = true
    console.log('')
    console.log('🔍 Running startup service health checks...')
    
    // Import and run health check with a small delay
    setTimeout(async () => {
      try {
        const { performStartupHealthCheck } = await import('../startup/health-check')
        await performStartupHealthCheck()
      } catch (error) {
        console.error('❌ Health check failed:', error)
      }
    }, 500)
  }
}).catch((error) => {
  console.error('❌ Database connection failed:', error)
})

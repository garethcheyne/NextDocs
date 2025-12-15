// src/lib/startup/boot.ts
import { performStartupHealthCheck } from './health-check'

// Only run on server side
if (typeof window === 'undefined') {
  console.log('\n🚀 NextDocs Application Starting...')
  console.log('🌍 Environment:', process.env.NODE_ENV)
  console.log('📦 Next.js Version: 16.0.10')
  console.log('🐳 Docker Mode:', process.env.DOCKER_MODE || 'false')
  console.log('')

  // Delay health check to let Next.js finish starting
  setTimeout(async () => {
    await performStartupHealthCheck()
  }, 500)
}
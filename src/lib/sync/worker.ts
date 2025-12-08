import { processScheduledSyncs } from './sync-service'
import { startCommentSyncWorker, stopCommentSyncWorker } from './comment-sync-worker'

let isRunning = false
let intervalId: NodeJS.Timeout | null = null

export function startSyncWorker() {
  if (isRunning) {
    console.log('⚠️  Sync worker already running')
    return
  }

  console.log('\n╔════════════════════════════════════════════════════╗')
  console.log('║        🤖 SYNC WORKER INITIALIZED                 ║')
  console.log('╚════════════════════════════════════════════════════╝')
  console.log('⏰ Check interval: Every 60 seconds')
  console.log('🔄 Auto-sync: Enabled for repositories with schedules')
  console.log('💬 Comment sync: Enabled (background polling)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  isRunning = true

  // Start the comment sync worker
  startCommentSyncWorker()

  // Run every minute
  intervalId = setInterval(async () => {
    try {
      await processScheduledSyncs()
    } catch (error) {
      console.error('❌ Sync worker error:', error)
    }
  }, 60 * 1000) // 60 seconds

  // Run immediately on startup
  console.log('🚀 Running initial sync check...\n')
  processScheduledSyncs().catch((error) => {
    console.error('❌ Initial sync worker error:', error)
  })
}

export function stopSyncWorker() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  
  // Stop the comment sync worker
  stopCommentSyncWorker()
  
  isRunning = false
  console.log('Sync worker stopped')
}

export function getWorkerStatus() {
  return {
    isRunning,
    intervalActive: intervalId !== null,
    checkInterval: '60 seconds',
  }
}

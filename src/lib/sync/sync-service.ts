import { prisma } from '@/lib/db/prisma'
import { syncAzureDevOps } from './azure-devops'
import { syncGitHub } from './github'
import { storeDocuments } from './document-storage'
import { parseAndStoreMeta } from './metadata-parser'
import { storeApiSpecs } from './api-spec-storage'

export async function syncRepository(repositoryId: string) {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
  })

  if (!repository) {
    throw new Error('Repository not found')
  }

  if (!repository.enabled) {
    throw new Error('Repository is disabled')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔄 SYNC START: ${repository.name}`)
  console.log(`📦 Source: ${repository.source.toUpperCase()}`)
  if (repository.source === 'azure') {
    console.log(`🏢 Organization: ${repository.organization}`)
    console.log(`📁 Project: ${repository.project}`)
    console.log(`📂 Repository: ${repository.repositoryId}`)
  } else {
    console.log(`👤 Owner: ${repository.owner}`)
    console.log(`📂 Repository: ${repository.repo}`)
  }
  console.log(`🌿 Branch: ${repository.branch}`)
  console.log(`📍 Base Path: ${repository.basePath}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Create sync log entry
  const syncLog = await prisma.syncLog.create({
    data: {
      repositoryId: repository.id,
      status: 'in_progress',
      filesChanged: 0,
      filesAdded: 0,
      filesDeleted: 0,
    },
  })

  const startTime = Date.now()

  try {
    console.log('⏳ Fetching documents from source...')
    
    // Fetch documents and API specs from source
    let documents: Array<{ path: string; content: string }> = []
    let apiSpecs: Array<{ path: string; content: string }> = []
    
    if (repository.source === 'azure') {
      const result = await syncAzureDevOps(repository)
      documents = result.documents
      apiSpecs = result.apiSpecs
    } else if (repository.source === 'github') {
      const result = await syncGitHub(repository)
      documents = result.documents
      apiSpecs = result.apiSpecs
    }

    console.log(`✅ Found ${documents.length} markdown files`)
    if (apiSpecs.length > 0) {
      console.log(`✅ Found ${apiSpecs.length} API specification files`)
    }
    
    // Separate metadata files from content files
    const metaFiles = documents.filter(d => d.path.endsWith('_meta.json'))
    const contentFiles = documents.filter(d => !d.path.endsWith('_meta.json'))
    
    // Process metadata files first
    if (metaFiles.length > 0) {
      await parseAndStoreMeta(repository.id, metaFiles)
    }
    
    // Log first few files
    if (contentFiles.length > 0) {
      console.log('📄 Sample files:')
      contentFiles.slice(0, 5).forEach((doc, idx) => {
        console.log(`   ${idx + 1}. ${doc.path}`)
      })
      if (contentFiles.length > 5) {
        console.log(`   ... and ${contentFiles.length - 5} more`)
      }
    }

    // Store documents in database
    const storageResult = await storeDocuments(repository.id, syncLog.id, contentFiles)

    // Store API specs in database
    let apiSpecResult = { totalAdded: 0, totalUpdated: 0 }
    if (apiSpecs.length > 0) {
      apiSpecResult = await storeApiSpecs(repository.id, apiSpecs)
    }

    const duration = Date.now() - startTime

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'success',
        filesAdded: storageResult.totalAdded,
        filesChanged: storageResult.totalUpdated,
        filesDeleted: storageResult.totalDeleted,
        completedAt: new Date(),
        duration,
      },
    })

    // Update repository last sync
    await prisma.repository.update({
      where: { id: repository.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
      },
    })

    console.log(`✨ SYNC COMPLETE: ${repository.name}`)
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log(`📊 Documents: ${storageResult.totalAdded} added, ${storageResult.totalUpdated} changed, ${storageResult.totalDeleted} deleted`)
    if (apiSpecs.length > 0) {
      console.log(`📊 API Specs: ${apiSpecResult.totalAdded} added, ${apiSpecResult.totalUpdated} updated`)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return { success: true, filesCount: contentFiles.length }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error(`❌ SYNC FAILED: ${repository.name}`)
    console.error(`⚠️  Error: ${errorMessage}`)
    console.error(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Update sync log with error
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
        duration,
      },
    })

    // Update repository status
    await prisma.repository.update({
      where: { id: repository.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'failed',
      },
    })

    throw error
  }
}

export async function processScheduledSyncs() {
  // Get repositories that need syncing
  const repositories = await prisma.repository.findMany({
    where: {
      enabled: true,
      syncFrequency: { gt: 0 }, // Not manual
    },
  })

  const now = new Date()
  const syncPromises = []

  console.log(`\n🔍 Checking ${repositories.length} repositories for scheduled syncs...`)

  for (const repo of repositories) {
    // Check if sync is due
    if (!repo.lastSyncAt) {
      // Never synced, sync now
      console.log(`   📌 ${repo.name}: Never synced - queuing sync`)
      syncPromises.push(syncRepository(repo.id))
    } else {
      const timeSinceLastSync = now.getTime() - repo.lastSyncAt.getTime()
      const syncDue = timeSinceLastSync >= repo.syncFrequency * 1000
      const minutesSinceSync = Math.floor(timeSinceLastSync / 60000)
      const minutesUntilNext = Math.floor((repo.syncFrequency * 1000 - timeSinceLastSync) / 60000)

      if (syncDue) {
        console.log(`   📌 ${repo.name}: Last synced ${minutesSinceSync}m ago - queuing sync`)
        syncPromises.push(syncRepository(repo.id))
      } else {
        console.log(`   ⏰ ${repo.name}: Next sync in ${minutesUntilNext}m`)
      }
    }
  }

  if (syncPromises.length > 0) {
    console.log(`\n🚀 Processing ${syncPromises.length} scheduled sync(s)...\n`)
    const results = await Promise.allSettled(syncPromises)
    
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`\n📈 Scheduled sync batch complete: ${succeeded} succeeded, ${failed} failed\n`)
  } else {
    console.log('   ✓ No syncs due at this time\n')
  }
}

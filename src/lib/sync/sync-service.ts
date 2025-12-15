import { prisma } from '@/lib/db/prisma'
import { syncAzureDevOps } from './azure-devops'
import { syncGitHub } from './github'
import { storeDocuments } from './document-storage'
import { parseAndStoreMeta } from './metadata-parser'
import { storeApiSpecs } from './api-spec-storage'
import { storeAuthors } from './author-storage'
import { syncRepositoryImages, syncRepositoryImagesUnified } from './image-sync'

export async function syncRepository(repositoryId: string, ipAddress?: string) {
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
  if (ipAddress) {
    console.log(`🌐 Initiated by IP: ${ipAddress}`)
  }
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

    // Separate metadata files, author files, and content files
    const metaFiles = documents.filter(d => d.path.endsWith('_meta.json'))
    // Only process files that are specifically in an authors directory and are individual author JSON files
    const authorFiles = documents.filter(d => 
      d.path.includes('/authors/') && 
      d.path.endsWith('.json') && 
      !d.path.endsWith('_meta.json') &&
      !d.path.includes('/authors/index.json') // Exclude index files
    )
    const contentFiles = documents.filter(d => !d.path.endsWith('_meta.json') && !authorFiles.includes(d))

    console.log('\n📦 FETCHED FILES BREAKDOWN:')
    console.log(`   📄 Content files: ${contentFiles.length}`)
    console.log(`   👤 Author files: ${authorFiles.length}`)
    console.log(`   ⚙️  Metadata files: ${metaFiles.length}`)
    if (apiSpecs.length > 0) {
      console.log(`   📋 API specs: ${apiSpecs.length}`)
    }
    console.log(`   📊 Total: ${documents.length} markdown + ${apiSpecs.length} API specs\n`)

    // Log all content files
    if (contentFiles.length > 0) {
      console.log('📄 CONTENT FILES:')
      contentFiles.forEach((doc, idx) => {
        console.log(`   ${String(idx + 1).padStart(3)}. ${doc.path}`)
      })
      console.log('')
    }

    // Process metadata files first
    if (metaFiles.length > 0) {
      console.log('⚙️  Processing metadata files...')
      await parseAndStoreMeta(repository.id, metaFiles)
      console.log(`✅ Metadata processed\n`)
    }

    // Process author files
    let authorResult = { authorsAdded: 0, authorsUpdated: 0, totalProcessed: 0 }
    if (authorFiles.length > 0) {
      console.log('👤 Processing author files...')
      authorResult = await storeAuthors(authorFiles)
      console.log(`✅ Authors: ${authorResult.authorsAdded} added, ${authorResult.authorsUpdated} updated\n`)
    } else {
      console.log('👤 No author files to process\n')
    }

    // Store documents in database
    console.log('💾 Storing documents...')
    const storageResult = await storeDocuments(repository.id, syncLog.id, contentFiles)

    // Store API specs in database
    let apiSpecResult = { totalAdded: 0, totalUpdated: 0, totalDeleted: 0 }
    if (apiSpecs.length > 0) {
      console.log('📋 Processing API specifications...')
      apiSpecResult = await storeApiSpecs(repository.id, apiSpecs)
    } else {
      console.log('📋 No API specs to process')
    }

    // Sync images from repository
    let imageResult = { synced: 0, updated: 0, deleted: 0, skipped: 0, errors: [] as string[] }
    if (repository.syncImages) {
      try {
        if (repository.source === 'github') {
          imageResult = await syncRepositoryImages(
            repository.owner!,
            repository.repo!,
            repository.patEncrypted!,
            repository.id,
            repository.slug,
            repository.branch
          )
        } else if (repository.source === 'azure') {
          imageResult = await syncRepositoryImagesUnified({
            source: 'azure',
            repositoryId: repository.id,
            repositorySlug: repository.slug,
            branch: repository.branch,
            organization: repository.organization!,
            project: repository.project!,
            azureRepositoryId: repository.repositoryId!,
            patEncrypted: repository.patEncrypted!,
          })
        }
      } catch (error) {
        console.error('⚠️  Image sync failed but continuing:', error)
      }
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

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✨ SYNC COMPLETE: ${repository.name}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s\n`)
    console.log('📊 RESULTS SUMMARY:')
    console.log(`   📄 Documents: ${storageResult.docsAdded} added, ${storageResult.docsUpdated} updated, ${storageResult.docsDeleted} deleted`)
    if (storageResult.blogsAdded > 0 || storageResult.blogsUpdated > 0 || storageResult.blogsDeleted > 0) {
      console.log(`   📝 Blog Posts: ${storageResult.blogsAdded} added, ${storageResult.blogsUpdated} updated, ${storageResult.blogsDeleted} deleted`)
    }
    if (authorResult.authorsAdded > 0 || authorResult.authorsUpdated > 0) {
      console.log(`   👤 Authors: ${authorResult.authorsAdded} added, ${authorResult.authorsUpdated} updated`)
    }
    if (apiSpecResult.totalAdded > 0 || apiSpecResult.totalUpdated > 0 || apiSpecResult.totalDeleted > 0) {
      console.log(`   📋 API Specs: ${apiSpecResult.totalAdded} added, ${apiSpecResult.totalUpdated} updated, ${apiSpecResult.totalDeleted} deleted`)
    }
    if (imageResult.synced > 0 || imageResult.updated > 0 || imageResult.deleted > 0) {
      console.log(`   🖼️  Images: ${imageResult.synced} added, ${imageResult.updated} updated, ${imageResult.deleted} deleted, ${imageResult.skipped} unchanged`)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return { success: true, filesCount: contentFiles.length }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(`❌ SYNC FAILED: ${repository.name}`)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
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

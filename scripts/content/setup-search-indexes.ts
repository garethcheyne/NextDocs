/**
 * Initialize search vectors for API specs and feature requests
 * Run this after the migration to create indexes and populate search vectors
 */

import { prisma } from '../src/lib/db/prisma'
import { 
  createSearchIndexes, 
  rebuildAllSearchVectors 
} from '../src/lib/search/indexer'

async function main() {
  console.log('🔍 Initializing search vectors...\n')

  try {
    // Create GIN indexes for fast search
    console.log('Creating search indexes...')
    await createSearchIndexes()

    // Rebuild all search vectors
    console.log('\nRebuilding search vectors...')
    await rebuildAllSearchVectors()

    console.log('\n✅ Search vector initialization complete!')
  } catch (error) {
    console.error('❌ Error initializing search vectors:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

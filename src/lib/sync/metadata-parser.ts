import { prisma } from '@/lib/db/prisma'

export interface MetaEntry {
  title: string
  icon?: string
  description?: string
}

export interface MetaJson {
  [key: string]: MetaEntry
}

export async function parseAndStoreMeta(
  repositoryId: string,
  metaFiles: Array<{ path: string; content: string }>,
  basePath?: string
) {
  console.log(`📋 Processing ${metaFiles.length} _meta.json file(s)...`)

  const processedSlugs: string[] = []
  const metaFilePaths = new Set(metaFiles.map(f => f.path))

  for (const metaFile of metaFiles) {
    try {
      const meta: MetaJson = JSON.parse(metaFile.content)
      
      // Strip base path if provided (e.g., /documentation/docs/... -> docs/...)
      let normalizedPath = metaFile.path
      if (basePath) {
        const basePathClean = basePath.replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        if (normalizedPath.startsWith(basePathClean + '/')) {
          normalizedPath = normalizedPath.substring(basePathClean.length + 1)
        }
      }
      
      // Extract directory from path (e.g., docs/eway/_meta.json -> docs/eway)
      const pathParts = normalizedPath.split('/').filter(Boolean)
      const dir = pathParts.slice(0, -1).join('/')
      
      // Determine hierarchy level based on path depth
      // /docs/_meta.json -> level 0 (root categories like commercial-wiki, eway)
      // /docs/eway/_meta.json -> level 1 (eway subcategories like api-integration)
      // /docs/eway/payment-methods/_meta.json -> level 2 (nested subcategories)
      const pathDepth = pathParts.length - 1 // -1 for _meta.json file
      
      let order = 0
      for (const [slug, entry] of Object.entries(meta)) {
        // Skip index entries
        if (slug === 'index') continue

        let categorySlug: string
        let parentSlug: string | null = null
        let level: number
        
        if (pathDepth === 1) {
          // Root level: /docs/_meta.json
          // Create top-level categories (commercial-wiki, eway, dynamics-365-bc, etc.)
          categorySlug = slug
          parentSlug = null
          level = 0
        } else if (pathDepth === 2) {
          // Category level: /docs/eway/_meta.json
          // Create subcategories under eway (api-integration, payment-methods, etc.)
          const parentCategory = pathParts[pathParts.length - 2] // e.g., "eway"
          categorySlug = `${parentCategory}/${slug}`
          parentSlug = parentCategory
          level = 1
        } else {
          // Deeper nesting: /docs/eway/payment-methods/_meta.json
          const parentPath = pathParts.slice(1, -1).join('/') // e.g., "eway/payment-methods"
          categorySlug = `${parentPath}/${slug}`
          parentSlug = parentPath
          level = pathDepth - 1
        }

        processedSlugs.push(categorySlug)

        await prisma.categoryMetadata.upsert({
          where: {
            repositoryId_categorySlug: {
              repositoryId,
              categorySlug,
            },
          },
          update: {
            title: entry.title,
            icon: entry.icon,
            description: entry.description,
            order,
            parentSlug,
            level,
          },
          create: {
            repositoryId,
            categorySlug,
            title: entry.title,
            icon: entry.icon,
            description: entry.description,
            order,
            parentSlug,
            level,
          },
        })
        
        order++
      }
      
      console.log(`   ✅ Processed metadata from ${metaFile.path} (${Object.keys(meta).length - 1} entries, level ${pathDepth - 1})`)
    } catch (error) {
      console.error(`   ❌ Failed to parse ${metaFile.path}:`, error)
    }
  }

  // Delete category metadata that no longer exists
  // This handles two cases:
  // 1. Categories removed from _meta.json files that were processed
  // 2. Entire folders removed (their _meta.json files won't be in the sync)
  
  const allExistingCategories = await prisma.categoryMetadata.findMany({
    where: { repositoryId },
    select: {
      categorySlug: true,
      title: true,
    },
  })

  const categoriesToDelete = allExistingCategories.filter(cat => {
    // If this category was processed in this sync, keep it
    if (processedSlugs.includes(cat.categorySlug)) {
      return false
    }
    
    // Check if the category's _meta.json file should exist but doesn't
    // For category "eway/api-integration", the _meta.json would be at "docs/eway/_meta.json"
    const pathParts = cat.categorySlug.split('/')
    
    if (pathParts.length === 1) {
      // Root level category (e.g., "eway")
      // Should have _meta.json at "docs/_meta.json"
      const expectedMetaPath = 'docs/_meta.json'
      // If the root _meta.json exists but this category wasn't in it, delete it
      return metaFilePaths.has(expectedMetaPath)
    } else {
      // Nested category (e.g., "eway/api-integration")
      // Should be defined in the parent's _meta.json
      const parentPath = pathParts.slice(0, -1).join('/')
      const expectedMetaPath = `docs/${parentPath}/_meta.json`
      // If the parent _meta.json exists but this category wasn't in it, delete it
      return metaFilePaths.has(expectedMetaPath)
    }
  })

  for (const category of categoriesToDelete) {
    await prisma.categoryMetadata.delete({ 
      where: { 
        repositoryId_categorySlug: {
          repositoryId,
          categorySlug: category.categorySlug,
        }
      } 
    })
    console.log(`   🗑️  Deleted orphaned category: ${category.title} (${category.categorySlug})`)
  }

  if (categoriesToDelete.length > 0) {
    console.log(`   ✅ Cleaned up ${categoriesToDelete.length} orphaned categories`)
  }
}

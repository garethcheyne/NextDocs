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
  metaFiles: Array<{ path: string; content: string }>
) {
  console.log(`📋 Processing ${metaFiles.length} _meta.json file(s)...`)

  for (const metaFile of metaFiles) {
    try {
      const meta: MetaJson = JSON.parse(metaFile.content)
      
      // Extract directory from path (e.g., /docs/eway/_meta.json -> docs/eway)
      const pathParts = metaFile.path.split('/')
      const dir = pathParts.slice(0, -1).join('/')
      
      // Skip root-level _meta.json (e.g., /docs/_meta.json)
      const isRootMeta = dir.split('/').filter(Boolean).length === 1 // e.g., "docs"
      
      if (isRootMeta) {
        console.log(`   ⏭️  Skipping root _meta.json: ${metaFile.path}`)
        continue
      }
      
      // Determine if this is a top-level category or nested
      // For /docs/eway/_meta.json -> process as root categories (level 0)
      // For /docs/eway/payment-methods/_meta.json -> process as eway subcategories (level 1)
      
      // Determine if this is a top-level category or nested
      // For /docs/eway/_meta.json -> process as root categories (level 0)
      // For /docs/eway/payment-methods/_meta.json -> process as eway subcategories (level 1)
      const isCategoryMeta = dir.split('/').filter(Boolean).length === 2 // e.g., "docs/eway"
      
      let order = 0
      for (const [slug, entry] of Object.entries(meta)) {
        // Skip index entries
        if (slug === 'index') continue

        // For category-level _meta.json (e.g., /docs/eway/_meta.json)
        // -> create root category with slug "eway"
        // For nested _meta.json (e.g., /docs/eway/payment-methods/_meta.json)
        // -> create child category with slug "eway/payment-methods"
        let categorySlug = slug
        let parentSlug: string | null = null
        let level = 0
        
        if (!isCategoryMeta) {
          // Extract parent category from path
          // e.g., /docs/eway/payment-methods/_meta.json -> parent is "eway"
          const parentCategory = pathParts[pathParts.length - 2]
          parentSlug = parentCategory
          categorySlug = `${parentCategory}/${slug}`
          level = 1
        }

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
      
      console.log(`   ✅ Processed metadata from ${metaFile.path} (${Object.keys(meta).length - 1} entries)`)
    } catch (error) {
      console.error(`   ❌ Failed to parse ${metaFile.path}:`, error)
    }
  }
}

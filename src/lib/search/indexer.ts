// lib/search/indexer.ts
import { prisma } from '@/lib/db/prisma'
import { cacheDelPattern } from '@/lib/redis'

/**
 * Generate search vector for a text document
 * Combines title, content, and tags into a searchable text
 */
export function generateSearchText(
  title: string,
  content: string,
  excerpt?: string,
  tags: string[] = []
): string {
  // Weight title more heavily by repeating it
  const weightedTitle = Array(3).fill(title).join(' ')
  const tagText = tags.join(' ')
  const excerptText = excerpt || ''
  
  return `${weightedTitle} ${excerptText} ${content} ${tagText}`
    .replace(/[#*`]/g, '') // Remove markdown symbols
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Update search vector for a document
 */
export async function updateDocumentSearchVector(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      title: true,
      content: true,
      excerpt: true,
      tags: true,
    },
  })

  if (!doc) {
    throw new Error(`Document ${documentId} not found`)
  }

  const searchText = generateSearchText(
    doc.title,
    doc.content,
    doc.excerpt || undefined,
    doc.tags
  )

  await prisma.$executeRaw`
    UPDATE "Document"
    SET "searchVector" = to_tsvector('english', ${searchText})
    WHERE id = ${documentId}
  `

  // Invalidate search cache
  await cacheDelPattern('search:*')
}

/**
 * Update search vector for a blog post
 */
export async function updateBlogPostSearchVector(postId: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: {
      title: true,
      content: true,
      excerpt: true,
      tags: true,
    },
  })

  if (!post) {
    throw new Error(`Blog post ${postId} not found`)
  }

  const searchText = generateSearchText(
    post.title,
    post.content,
    post.excerpt || undefined,
    post.tags
  )

  await prisma.$executeRaw`
    UPDATE "BlogPost"
    SET "searchVector" = to_tsvector('english', ${searchText})
    WHERE id = ${postId}
  `

  // Invalidate search cache
  await cacheDelPattern('search:*')
}

/**
 * Update search vector for an API spec
 */
export async function updateApiSpecSearchVector(specId: string) {
  const spec = await prisma.apiSpec.findUnique({
    where: { id: specId },
    select: {
      name: true,
      description: true,
      version: true,
      specContent: true,
    },
  })

  if (!spec) {
    throw new Error(`API spec ${specId} not found`)
  }

  // Extract searchable text from spec content (assuming it's JSON/YAML)
  let specText = ''
  try {
    if (spec.specContent) {
      const specObj = typeof spec.specContent === 'string' 
        ? JSON.parse(spec.specContent) 
        : spec.specContent
      
      // Extract endpoints, descriptions, tags from OpenAPI spec
      if (specObj.paths) {
        specText = JSON.stringify(specObj.paths)
          .replace(/[{}":\[\]]/g, ' ') // Remove JSON syntax
          .replace(/\s+/g, ' ')
      }
    }
  } catch (e) {
    console.error('Failed to parse spec content for search:', e)
  }

  const searchText = generateSearchText(
    spec.name,
    specText,
    spec.description || undefined,
    [spec.version]
  )

  await prisma.$executeRaw`
    UPDATE "APISpec"
    SET "searchVector" = to_tsvector('english', ${searchText})
    WHERE id = ${specId}
  `

  // Invalidate search cache
  await cacheDelPattern('search:*')
}

/**
 * Update search vector for a feature request
 */
export async function updateFeatureRequestSearchVector(featureId: string) {
  const feature = await prisma.featureRequest.findUnique({
    where: { id: featureId },
    select: {
      title: true,
      description: true,
      tags: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!feature) {
    throw new Error(`Feature request ${featureId} not found`)
  }

  const categoryName = feature.category?.name || ''
  const searchText = generateSearchText(
    feature.title,
    feature.description,
    undefined,
    [...feature.tags, categoryName]
  )

  await prisma.$executeRaw`
    UPDATE "FeatureRequest"
    SET "searchVector" = to_tsvector('english', ${searchText})
    WHERE id = ${featureId}
  `

  // Invalidate search cache
  await cacheDelPattern('search:*')
}

/**
 * Rebuild all search vectors (run after initial migration or bulk updates)
 */
export async function rebuildAllSearchVectors() {
  console.log('Rebuilding search vectors for all documents...')
  
  // Update all documents
  await prisma.$executeRaw`
    UPDATE "Document"
    SET "searchVector" = to_tsvector('english', 
      concat_ws(' ', 
        "title", "title", "title",  -- Weight title 3x
        COALESCE("excerpt", ''),
        "content",
        array_to_string("tags", ' ')
      )
    )
  `

  // Update all blog posts
  await prisma.$executeRaw`
    UPDATE "BlogPost"
    SET "searchVector" = to_tsvector('english',
      concat_ws(' ',
        "title", "title", "title",  -- Weight title 3x
        COALESCE("excerpt", ''),
        "content",
        array_to_string("tags", ' ')
      )
    )
  `

  // Update all API specs
  await prisma.$executeRaw`
    UPDATE "APISpec"
    SET "searchVector" = to_tsvector('english',
      concat_ws(' ',
        "name", "name", "name",  -- Weight name 3x
        COALESCE("description", ''),
        "version"
      )
    )
  `

  // Update all feature requests
  await prisma.$executeRaw`
    UPDATE "FeatureRequest"
    SET "searchVector" = to_tsvector('english',
      concat_ws(' ',
        "title", "title", "title",  -- Weight title 3x
        "description",
        array_to_string("tags", ' ')
      )
    )
  `

  // Invalidate all search cache
  await cacheDelPattern('search:*')
  
  console.log('✓ Search vectors rebuilt successfully')
}

/**
 * Create GIN index for faster full-text search
 * Run this once during setup
 */
export async function createSearchIndexes() {
  try {
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "Document_searchVector_idx"
      ON "Document" USING GIN("searchVector")
    `

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "BlogPost_searchVector_idx"
      ON "BlogPost" USING GIN("searchVector")
    `

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "APISpec_searchVector_idx"
      ON "APISpec" USING GIN("searchVector")
    `

    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "FeatureRequest_searchVector_idx"
      ON "FeatureRequest" USING GIN("searchVector")
    `

    console.log('✓ Search indexes created successfully')
  } catch (error) {
    console.error('Error creating search indexes:', error)
  }
}

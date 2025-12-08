// lib/search/query.ts
import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { cacheGet, cacheSet } from '@/lib/redis'

export interface SearchResult {
  id: string
  type: 'document' | 'blog' | 'api-spec' | 'feature'
  title: string
  excerpt: string
  url: string
  category?: string
  tags: string[]
  rank: number
  highlight?: string
  repository?: {
    id: string
    name: string
    slug: string
  }
}

export interface SearchOptions {
  limit?: number
  offset?: number
  types?: Array<'document' | 'blog' | 'api-spec' | 'feature'>
  category?: string
  tags?: string[]
}

/**
 * Search across documents, blog posts, and API specs
 */
export async function searchContent(
  query: string,
  options: SearchOptions = {}
): Promise<{ results: SearchResult[]; total: number }> {
  const {
    limit = 10,
    offset = 0,
    types = ['document', 'blog', 'api-spec', 'feature'],
    category,
    tags,
  } = options

  // Generate cache key
  const cacheKey = `search:${query}:${JSON.stringify(options)}`

  // Try cache first
  const cached = await cacheGet<{ results: SearchResult[]; total: number }>(cacheKey)
  if (cached) {
    return cached
  }

  const searchQuery = query.trim()
  if (!searchQuery) {
    return { results: [], total: 0 }
  }

  // Add prefix matching for partial words (e.g., "dyna" matches "dynamics")
  const tsQuery = searchQuery.split(/\s+/).map(word => `${word}:*`).join(' & ')

  const results: SearchResult[] = []

  // Search documents
  if (types.includes('document')) {
    let docs: any[]
    
    if (category && tags && tags.length > 0) {
      docs = await prisma.$queryRaw`
        SELECT 
          d.id,
          d.title,
          d.excerpt,
          d.slug,
          d.category,
          d.tags,
          ts_rank(d."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', d.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(d.category, '/', 1) 
             AND cm."repositoryId" = d."repositoryId" 
             LIMIT 1),
            SPLIT_PART(d.category, '/', 1)
          ) as "categoryTitle"
        FROM "Document" d
        JOIN "Repository" r ON d."repositoryId" = r.id
        WHERE d."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND d.category = ${category}
          AND d.tags && ARRAY[${Prisma.join(tags)}]::text[]
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else if (category) {
      docs = await prisma.$queryRaw`
        SELECT 
          d.id,
          d.title,
          d.excerpt,
          d.slug,
          d.category,
          d.tags,
          ts_rank(d."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', d.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(d.category, '/', 1) 
             AND cm."repositoryId" = d."repositoryId" 
             LIMIT 1),
            SPLIT_PART(d.category, '/', 1)
          ) as "categoryTitle"
        FROM "Document" d
        JOIN "Repository" r ON d."repositoryId" = r.id
        WHERE d."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND d.category = ${category}
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else if (tags && tags.length > 0) {
      docs = await prisma.$queryRaw`
        SELECT 
          d.id,
          d.title,
          d.excerpt,
          d.slug,
          d.category,
          d.tags,
          ts_rank(d."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', d.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(d.category, '/', 1) 
             AND cm."repositoryId" = d."repositoryId" 
             LIMIT 1),
            SPLIT_PART(d.category, '/', 1)
          ) as "categoryTitle"
        FROM "Document" d
        JOIN "Repository" r ON d."repositoryId" = r.id
        WHERE d."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND d.tags && ARRAY[${Prisma.join(tags)}]::text[]
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else {
      docs = await prisma.$queryRaw`
        SELECT 
          d.id,
          d.title,
          d.excerpt,
          d.slug,
          d.category,
          d.tags,
          ts_rank(d."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', d.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(d.category, '/', 1) 
             AND cm."repositoryId" = d."repositoryId" 
             LIMIT 1),
            SPLIT_PART(d.category, '/', 1)
          ) as "categoryTitle"
        FROM "Document" d
        JOIN "Repository" r ON d."repositoryId" = r.id
        WHERE d."searchVector" @@ to_tsquery('english', ${tsQuery})
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    }

    results.push(
      ...docs.map((doc) => ({
        id: doc.id,
        type: 'document' as const,
        title: doc.title,
        excerpt: doc.excerpt || '',
        url: `/${doc.slug}`,
        category: doc.categoryTitle,
        tags: doc.tags || [],
        rank: parseFloat(doc.rank),
        highlight: doc.highlight,
        repository: {
          id: doc.repositoryId,
          name: doc.repositoryName,
          slug: doc.repositorySlug,
        },
      }))
    )
  }

  // Search blog posts
  if (types.includes('blog')) {
    let posts: any[]
    
    if (category && tags && tags.length > 0) {
      posts = await prisma.$queryRaw`
        SELECT 
          b.id,
          b.title,
          b.excerpt,
          b.slug,
          b.category,
          b.tags,
          ts_rank(b."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', b.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(b.category, '/', 1) 
             AND cm."repositoryId" = b."repositoryId" 
             LIMIT 1),
            SPLIT_PART(b.category, '/', 1)
          ) as "categoryTitle"
        FROM "BlogPost" b
        JOIN "Repository" r ON b."repositoryId" = r.id
        WHERE b."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND b."isDraft" = false
          AND b.category = ${category}
          AND b.tags && ARRAY[${Prisma.join(tags)}]::text[]
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else if (category) {
      posts = await prisma.$queryRaw`
        SELECT 
          b.id,
          b.title,
          b.excerpt,
          b.slug,
          b.category,
          b.tags,
          ts_rank(b."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', b.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(b.category, '/', 1) 
             AND cm."repositoryId" = b."repositoryId" 
             LIMIT 1),
            SPLIT_PART(b.category, '/', 1)
          ) as "categoryTitle"
        FROM "BlogPost" b
        JOIN "Repository" r ON b."repositoryId" = r.id
        WHERE b."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND b."isDraft" = false
          AND b.category = ${category}
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else if (tags && tags.length > 0) {
      posts = await prisma.$queryRaw`
        SELECT 
          b.id,
          b.title,
          b.excerpt,
          b.slug,
          b.category,
          b.tags,
          ts_rank(b."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', b.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(b.category, '/', 1) 
             AND cm."repositoryId" = b."repositoryId" 
             LIMIT 1),
            SPLIT_PART(b.category, '/', 1)
          ) as "categoryTitle"
        FROM "BlogPost" b
        JOIN "Repository" r ON b."repositoryId" = r.id
        WHERE b."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND b."isDraft" = false
          AND b.tags && ARRAY[${Prisma.join(tags)}]::text[]
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else {
      posts = await prisma.$queryRaw`
        SELECT 
          b.id,
          b.title,
          b.excerpt,
          b.slug,
          b.category,
          b.tags,
          ts_rank(b."searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', b.content, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight,
          r.id as "repositoryId",
          r.name as "repositoryName",
          r.slug as "repositorySlug",
          COALESCE(
            (SELECT cm.title 
             FROM "CategoryMetadata" cm 
             WHERE cm."categorySlug" = SPLIT_PART(b.category, '/', 1) 
             AND cm."repositoryId" = b."repositoryId" 
             LIMIT 1),
            SPLIT_PART(b.category, '/', 1)
          ) as "categoryTitle"
        FROM "BlogPost" b
        JOIN "Repository" r ON b."repositoryId" = r.id
        WHERE b."searchVector" @@ to_tsquery('english', ${tsQuery})
          AND b."isDraft" = false
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    }

    results.push(
      ...posts.map((post) => ({
        id: post.id,
        type: 'blog' as const,
        title: post.title,
        excerpt: post.excerpt || '',
        url: `/${post.slug}`,
        category: post.categoryTitle,
        tags: post.tags || [],
        rank: parseFloat(post.rank),
        highlight: post.highlight,
        repository: {
          id: post.repositoryId,
          name: post.repositoryName,
          slug: post.repositorySlug,
        },
      }))
    )
  }

  // Search API specs
  if (types.includes('api-spec')) {
    let specs: any[]

    specs = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        slug,
        version,
        description,
        category,
        ts_rank("searchVector", to_tsquery('english', ${tsQuery})) as rank
      FROM "APISpec"
      WHERE "searchVector" @@ to_tsquery('english', ${tsQuery})
        AND enabled = true
        ${category ? Prisma.sql`AND category = ${category}` : Prisma.empty}
      ORDER BY rank DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    results.push(
      ...specs.map((spec) => ({
        id: spec.id,
        type: 'api-spec' as const,
        title: `${spec.name} v${spec.version}`,
        excerpt: spec.description || '',
        url: `/api-specs/${spec.slug}/${spec.version}`,
        category: spec.category || undefined,
        tags: [], // APISpec doesn't have tags in the schema
        rank: parseFloat(spec.rank),
      }))
    )
  }

  // Search feature requests
  if (types.includes('feature')) {
    let features: any[]

    if (tags && tags.length > 0) {
      features = await prisma.$queryRaw`
        SELECT 
          id,
          title,
          slug,
          description,
          "tagIds",
          ts_rank("searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', description, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight
        FROM "FeatureRequest"
        WHERE "searchVector" @@ to_tsquery('english', ${tsQuery})
          AND "tagIds" && ARRAY[${Prisma.join(tags)}]::text[]
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else {
      features = await prisma.$queryRaw`
        SELECT 
          id,
          title,
          slug,
          description,
          "tagIds",
          ts_rank("searchVector", to_tsquery('english', ${tsQuery})) as rank,
          ts_headline('english', description, to_tsquery('english', ${tsQuery}),
            'MaxWords=30, MinWords=15, ShortWord=3, MaxFragments=1') as highlight
        FROM "FeatureRequest"
        WHERE "searchVector" @@ to_tsquery('english', ${tsQuery})
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    }

    results.push(
      ...features.map((feature) => ({
        id: feature.id,
        type: 'feature' as const,
        title: feature.title,
        excerpt: feature.description?.substring(0, 200) || '',
        url: `/features/${feature.slug}`,
        tags: feature.tagIds || [],
        rank: parseFloat(feature.rank),
        highlight: feature.highlight,
      }))
    )
  }

  // Sort by rank and limit
  const sortedResults = results.sort((a, b) => b.rank - a.rank).slice(0, limit)

  const response = {
    results: sortedResults,
    total: sortedResults.length,
  }

  // Cache results for 5 minutes
  await cacheSet(cacheKey, response, 300)

  return response
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<string[]> {
  const cacheKey = `suggestions:${query}`

  // Try cache first
  const cached = await cacheGet<string[]>(cacheKey)
  if (cached) {
    return cached
  }

  const searchQuery = query.trim()
  if (!searchQuery || searchQuery.length < 2) {
    return []
  }

  // Get most relevant titles
  const docs = await prisma.document.findMany({
    where: {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } },
      ],
    },
    select: { title: true },
    take: limit,
  })

  const posts = await prisma.blogPost.findMany({
    where: {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } },
      ],
      isDraft: false,
    },
    select: { title: true },
    take: limit,
  })

  const features = await prisma.featureRequest.findMany({
    where: {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { tagIds: { has: searchQuery } },
      ],
    },
    select: { title: true },
    take: limit,
  })

  const suggestions = [
    ...docs.map((d) => d.title),
    ...posts.map((p) => p.title),
    ...features.map((f) => f.title),
  ].slice(0, limit)

  // Cache for 10 minutes
  await cacheSet(cacheKey, suggestions, 600)

  return suggestions
}

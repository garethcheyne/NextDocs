import crypto from 'crypto'
import matter from 'gray-matter'
import { extractReleaseBlocks, ExtractedRelease } from '@/lib/markdown/release-block-preprocessor'

export interface ParsedDocument {
  filePath: string
  fileName: string
  title: string
  slug: string
  content: string
  excerpt?: string
  category?: string
  tags: string[]
  author?: string
  publishedAt?: Date
  isDraft: boolean
  restricted: boolean
  restrictedRoles: string[]
  sourceHash: string
  releases: ExtractedRelease[]
}

export function parseMarkdownDocument(
  filePath: string,
  content: string
): ParsedDocument {
  // Parse frontmatter with error handling
  let frontmatter: any = {}
  let markdownContent = content
  
  try {
    const parsed = matter(content)
    frontmatter = parsed.data
    markdownContent = parsed.content
  } catch (error) {
    console.warn(`⚠️  Failed to parse frontmatter for ${filePath}, using content as-is:`, error instanceof Error ? error.message : error)
    // If frontmatter parsing fails, treat entire content as markdown
    // Try to extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      frontmatter.title = titleMatch[1]
    }
  }

  // Generate hash of source content
  const sourceHash = crypto.createHash('sha256').update(content).digest('hex')

  // Extract filename from path
  const fileName = filePath.split('/').pop() || filePath

  // Generate slug from path (remove .md extension, convert to URL-friendly)
  // For index.md files, use the parent directory as the slug
  let slug = filePath
    .replace(/\.md$/, '')
    .replace(/^\//, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
  
  // If this is an index file, use the parent directory
  if (fileName.toLowerCase() === 'index.md') {
    const pathParts = slug.split('/')
    // Remove 'index' from the end
    pathParts.pop()
    slug = pathParts.join('/') || 'docs' // Default to 'docs' if at root
  }

  // Extract title (from frontmatter or filename)
  const title =
    frontmatter.title ||
    fileName.replace(/\.md$/, '').replace(/-/g, ' ')

  // Extract excerpt (from frontmatter, content, or generate)
  const excerpt =
    frontmatter.excerpt ||
    frontmatter.description ||
    markdownContent.slice(0, 200).trim() + '...'

  // Parse published date
  let publishedAt: Date | undefined
  if (frontmatter.date || frontmatter.publishedAt || frontmatter.published) {
    const dateStr = frontmatter.date || frontmatter.publishedAt || frontmatter.published
    publishedAt = new Date(dateStr)
  }

  // Extract tags
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
    : typeof frontmatter.tags === 'string'
    ? frontmatter.tags.split(',').map((t: string) => t.trim())
    : []

  // Check if draft
  const isDraft = frontmatter.draft === true || frontmatter.status === 'draft'

  // Extract restriction settings
  const restricted = Boolean(frontmatter.restricted)
  let restrictedRoles: string[] = []
  if (frontmatter.restrictedRoles) {
    if (Array.isArray(frontmatter.restrictedRoles)) {
      restrictedRoles = frontmatter.restrictedRoles
        .map((role: any) => String(role).trim())
        .filter(Boolean)
    } else if (typeof frontmatter.restrictedRoles === 'string') {
      restrictedRoles = [frontmatter.restrictedRoles.trim()].filter(Boolean)
    }
  }

  // Extract category from folder structure
  // For /docs/product-name/index.md -> category: product-name
  // For /docs/product-name/topic.md -> category: product-name
  // For /docs/product-name/section/topic.md -> category: product-name
  let category = frontmatter.category
  if (!category && filePath.includes('/docs/')) {
    const pathParts = filePath.split('/')
    const docsIndex = pathParts.indexOf('docs')
    if (docsIndex >= 0 && pathParts.length > docsIndex + 1) {
      // Get the first folder after /docs/
      const nextPart = pathParts[docsIndex + 1]
      // If it's not index.md or a file, use it as category
      if (nextPart && !nextPart.endsWith('.md')) {
        category = nextPart
      } else if (nextPart && nextPart.toLowerCase() !== 'index.md' && pathParts.length > docsIndex + 2) {
        // If the next part is a file, check if there's a folder before it
        category = pathParts[docsIndex + 1]
      }
    }
  }

  // Extract release blocks from content
  const { releases } = extractReleaseBlocks(markdownContent)

  return {
    filePath,
    fileName,
    title,
    slug,
    content: markdownContent,
    excerpt,
    category,
    tags,
    author: frontmatter.author,
    publishedAt,
    isDraft,
    restricted,
    restrictedRoles,
    sourceHash,
    releases,
  }
}

export function isBlogPost(filePath: string): boolean {
  return filePath.toLowerCase().includes('/blog/')
}

export function isDocument(filePath: string): boolean {
  // Documents are markdown files that are not blog posts
  // This includes /docs/, /documentation/, or any .md/.mdx file not in /blog/
  const lower = filePath.toLowerCase()
  return lower.includes('/docs/') || 
         lower.includes('/documentation/') ||
         (lower.endsWith('.md') || lower.endsWith('.mdx')) && !lower.includes('/blog/')
}

import { prisma } from '@/lib/db/prisma'
import { resolveAuthor } from '@/lib/utils/author-resolver'
import { AuthorData } from '@/components/badges/client-author-badge'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Fetch full author data for client components
 * This runs server-side and returns serializable data
 */
export async function getAuthorData(authorSlug: string): Promise<AuthorData | null> {
  if (!authorSlug) return null

  try {
    const isEmail = emailRegex.test(authorSlug)

    if (isEmail) {
      // System user lookup
      const resolvedAuthor = await resolveAuthor(authorSlug)
      return {
        name: resolvedAuthor.name,
        email: resolvedAuthor.email,
        avatar: resolvedAuthor.image,
      }
    }

    // Content author lookup
    // First try as direct email
    let author = null
    
    if (authorSlug.includes('@')) {
      author = await prisma.author.findUnique({
        where: { email: authorSlug },
        select: {
          name: true,
          email: true,
          title: true,
          avatar: true,
          bio: true,
        },
      })
    } else {
      // Try to find by email or name containing the slug
      const slugWithoutDashes = authorSlug.replace(/-/g, ' ')
      author = await prisma.author.findFirst({
        where: {
          OR: [
            { email: { contains: authorSlug.replace(/-/g, '.'), mode: 'insensitive' } },
            { name: { equals: slugWithoutDashes, mode: 'insensitive' } },
            { name: { contains: authorSlug, mode: 'insensitive' } },
          ]
        },
        select: {
          name: true,
          email: true,
          title: true,
          avatar: true,
          bio: true,
        },
      })
    }

    if (!author) return null

    // Fetch documents by this author
    const documents = await prisma.document.findMany({
      where: {
        author: authorSlug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    })

    // Fetch blog posts by this author
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        author: authorSlug,
        isDraft: false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 5,
    })

    return {
      name: author.name,
      email: author.email || undefined,
      role: author.title || undefined,
      avatar: author.avatar,
      bio: author.bio,
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
      })),
      blogPosts: blogPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
      })),
    }
  } catch (error) {
    console.error('Error fetching author data:', error)
    return null
  }
}

/**
 * Batch fetch author data for multiple authors
 * More efficient when rendering lists
 */
export async function getAuthorsData(authorSlugs: string[]): Promise<Map<string, AuthorData>> {
  const uniqueSlugs = [...new Set(authorSlugs.filter(Boolean))]
  const authorDataMap = new Map<string, AuthorData>()

  await Promise.all(
    uniqueSlugs.map(async (slug) => {
      const data = await getAuthorData(slug)
      if (data) {
        authorDataMap.set(slug, data)
      }
    })
  )

  return authorDataMap
}

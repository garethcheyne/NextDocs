import { prisma } from '@/lib/db/prisma'

export interface AuthorData {
  name: string
  title: string
  email: string
  bio: string
  avatar: string
  social: {
    linkedin?: string
    github?: string
    website?: string
  }
  location: string
  joinedDate: string
}

export async function getAuthorBySlug(authorSlug: string): Promise<AuthorData | null> {
  try {
    // First try to find in Author model
    let author = null
    
    // Try as direct email first
    if (authorSlug.includes('@')) {
      author = await prisma.author.findUnique({
        where: { email: authorSlug },
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
        }
      })
    }
    
    if (author) {
      return {
        name: author.name,
        title: author.title || '',
        email: author.email,
        bio: author.bio || '',
        avatar: author.avatar || '',
        social: {
          linkedin: author.linkedin || undefined,
          github: author.github || undefined,
          website: author.website || undefined,
        },
        location: author.location || '',
        joinedDate: author.joinedDate?.toISOString() || author.createdAt.toISOString(),
      }
    }

    // Fallback: Try to find author file in the database (synced from /authors directory)
    const authorDoc = await prisma.document.findFirst({
      where: {
        slug: `authors/${authorSlug}`,
      },
    })

    if (authorDoc?.content) {
      // Parse JSON content
      const authorData = JSON.parse(authorDoc.content) as AuthorData
      return authorData
    }

    // Final fallback: Create a basic author object from the slug
    // Convert slug to a readable name (e.g., "gareth-cheyne" -> "Gareth Cheyne")
    if (authorSlug) {
      const name = authorSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return {
        name,
        title: '',
        email: '',
        bio: '',
        avatar: '',
        social: {},
        location: '',
        joinedDate: new Date().toISOString(),
      }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch author:', error)
    return null
  }
}

export async function getAuthorDocuments(authorSlug: string) {
  return await prisma.document.findMany({
    where: {
      author: authorSlug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      excerpt: true,
      publishedAt: true,
      tags: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 5,
  })
}

export async function getAuthorBlogPosts(authorSlug: string) {
  return await prisma.blogPost.findMany({
    where: {
      author: authorSlug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      tags: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 5,
  })
}

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
    // Try to find author file in the database (synced from /authors directory)
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

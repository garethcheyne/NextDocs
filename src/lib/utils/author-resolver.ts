import { prisma } from '@/lib/db/prisma'

export interface ResolvedAuthor {
  name: string
  email?: string
  image?: string | null
  isSystemUser: boolean
}

/**
 * Resolve author information - if author is an email that exists in the system,
 * return user details including avatar. Otherwise return the author as-is.
 */
export async function resolveAuthor(author: string): Promise<ResolvedAuthor> {
  // Check if author looks like an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmail = emailRegex.test(author)

  if (isEmail) {
    try {
      // Check if this email exists as a system user (case-insensitive)
      const systemUser = await prisma.user.findFirst({
        where: { 
          email: {
            equals: author,
            mode: 'insensitive'
          }
        },
        select: {
          name: true,
          email: true,
          image: true,
        },
      })

      if (systemUser) {
        return {
          name: systemUser.name || author,
          email: systemUser.email,
          image: systemUser.image,
          isSystemUser: true,
        }
      }
    } catch (error) {
      console.error('Error resolving author:', error)
    }
  }

  // Return author as-is (could be name, email not in system, etc.)
  return {
    name: author,
    email: isEmail ? author : undefined,
    isSystemUser: false,
  }
}

/**
 * Resolve multiple authors efficiently using a single database query
 */
export async function resolveAuthors(authors: string[]): Promise<Map<string, ResolvedAuthor>> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emails = authors.filter(author => emailRegex.test(author))
  const result = new Map<string, ResolvedAuthor>()

  // Initialize all authors as non-system users
  authors.forEach(author => {
    result.set(author, {
      name: author,
      email: emailRegex.test(author) ? author : undefined,
      isSystemUser: false,
    })
  })

  if (emails.length > 0) {
    try {
      // Get all system users with matching emails in one query
      const systemUsers = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: {
          name: true,
          email: true,
          image: true,
        },
      })

      // Update the map with system user data
      systemUsers.forEach(user => {
        if (user.email) {
          result.set(user.email, {
            name: user.name || user.email,
            email: user.email,
            image: user.image,
            isSystemUser: true,
          })
        }
      })
    } catch (error) {
      console.error('Error resolving multiple authors:', error)
    }
  }

  return result
}
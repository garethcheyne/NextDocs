import { prisma } from '@/lib/db/prisma'

interface AuthorFile {
  path: string
  content: string
}

interface AuthorData {
  email: string
  name: string
  title?: string
  bio?: string
  avatar?: string
  social?: {
    linkedin?: string
    github?: string
    website?: string
  }
  location?: string
  joinedDate?: string
}

export async function storeAuthors(authorFiles: AuthorFile[]) {
  let authorsAdded = 0
  let authorsUpdated = 0

  console.log(`📝 Processing ${authorFiles.length} author file(s)...`)

  for (const file of authorFiles) {
    try {
      // Parse JSON content
      const authorData: AuthorData = JSON.parse(file.content)

      // Validate required fields
      if (!authorData.email || !authorData.name) {
        console.log(`   ⚠️  Skipping ${file.path}: Missing required fields (email, name)`)
        continue
      }

      // Check if author exists
      const existing = await prisma.author.findUnique({
        where: { email: authorData.email }
      })

      if (existing) {
        // Update existing author
        await prisma.author.update({
          where: { email: authorData.email },
          data: {
            name: authorData.name,
            title: authorData.title || null,
            bio: authorData.bio || null,
            avatar: authorData.avatar || null,
            linkedin: authorData.social?.linkedin || null,
            github: authorData.social?.github || null,
            website: authorData.social?.website || null,
            location: authorData.location || null,
            joinedDate: authorData.joinedDate ? new Date(authorData.joinedDate) : null,
          }
        })
        authorsUpdated++
        console.log(`   ✅ Updated author: ${authorData.name} (${authorData.email})`)
      } else {
        // Create new author
        await prisma.author.create({
          data: {
            email: authorData.email,
            name: authorData.name,
            title: authorData.title || null,
            bio: authorData.bio || null,
            avatar: authorData.avatar || null,
            linkedin: authorData.social?.linkedin || null,
            github: authorData.social?.github || null,
            website: authorData.social?.website || null,
            location: authorData.location || null,
            joinedDate: authorData.joinedDate ? new Date(authorData.joinedDate) : null,
          }
        })
        authorsAdded++
        console.log(`   ✅ Added author: ${authorData.name} (${authorData.email})`)
      }
    } catch (error) {
      console.error(`   ❌ Failed to process ${file.path}:`, error)
    }
  }

  console.log(`   📊 Authors: ${authorsAdded} added, ${authorsUpdated} updated`)

  return {
    authorsAdded,
    authorsUpdated,
    totalProcessed: authorsAdded + authorsUpdated,
  }
}

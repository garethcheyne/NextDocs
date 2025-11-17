import { prisma } from '@/lib/db/prisma'
import { parseMarkdownDocument, isBlogPost, isDocument } from './document-parser'

interface Change {
  changeType: 'added' | 'modified' | 'deleted'
  documentType: 'document' | 'blog'
  filePath: string
  title: string
  oldHash?: string
  newHash?: string
}

export async function storeDocuments(
  repositoryId: string,
  syncLogId: string,
  documents: Array<{ path: string; content: string }>
) {
  let docsAdded = 0
  let docsUpdated = 0
  let blogsAdded = 0
  let blogsUpdated = 0
  const changes: Change[] = []

  console.log('💾 Storing documents in database...')

  for (const doc of documents) {
    try {
      const parsed = parseMarkdownDocument(doc.path, doc.content)

      // Determine if it's a blog post or documentation
      if (isBlogPost(doc.path)) {
        // Store as blog post
        const existing = await prisma.blogPost.findUnique({
          where: {
            repositoryId_filePath: {
              repositoryId,
              filePath: doc.path,
            },
          },
        })

        if (existing) {
          // Update if content changed
          if (existing.sourceHash !== parsed.sourceHash) {
            await prisma.blogPost.update({
              where: { id: existing.id },
              data: {
                title: parsed.title,
                slug: parsed.slug,
                content: parsed.content,
                excerpt: parsed.excerpt,
                category: parsed.category,
                tags: parsed.tags,
                author: parsed.author,
                publishedAt: parsed.publishedAt,
                isDraft: parsed.isDraft,
                sourceHash: parsed.sourceHash,
                lastSyncedAt: new Date(),
              },
            })
            blogsUpdated++
            changes.push({
              changeType: 'modified',
              documentType: 'blog',
              filePath: doc.path,
              title: parsed.title,
              oldHash: existing.sourceHash,
              newHash: parsed.sourceHash,
            })
          }
        } else {
          // Create new blog post
          await prisma.blogPost.create({
            data: {
              repositoryId,
              filePath: doc.path,
              fileName: parsed.fileName,
              title: parsed.title,
              slug: parsed.slug,
              content: parsed.content,
              excerpt: parsed.excerpt,
              category: parsed.category,
              tags: parsed.tags,
              author: parsed.author,
              publishedAt: parsed.publishedAt,
              isDraft: parsed.isDraft,
              sourceHash: parsed.sourceHash,
            },
          })
          blogsAdded++
          changes.push({
            changeType: 'added',
            documentType: 'blog',
            filePath: doc.path,
            title: parsed.title,
            newHash: parsed.sourceHash,
          })
        }
      } else if (isDocument(doc.path)) {
        // Store as documentation
        const existing = await prisma.document.findUnique({
          where: {
            repositoryId_filePath: {
              repositoryId,
              filePath: doc.path,
            },
          },
        })

        if (existing) {
          // Update if content changed
          if (existing.sourceHash !== parsed.sourceHash) {
            await prisma.document.update({
              where: { id: existing.id },
              data: {
                title: parsed.title,
                slug: parsed.slug,
                content: parsed.content,
                excerpt: parsed.excerpt,
                category: parsed.category,
                tags: parsed.tags,
                author: parsed.author,
                publishedAt: parsed.publishedAt,
                sourceHash: parsed.sourceHash,
                lastSyncedAt: new Date(),
              },
            })
            docsUpdated++
            changes.push({
              changeType: 'modified',
              documentType: 'document',
              filePath: doc.path,
              title: parsed.title,
              oldHash: existing.sourceHash,
              newHash: parsed.sourceHash,
            })
          }
        } else {
          // Create new document
          await prisma.document.create({
            data: {
              repositoryId,
              filePath: doc.path,
              fileName: parsed.fileName,
              title: parsed.title,
              slug: parsed.slug,
              content: parsed.content,
              excerpt: parsed.excerpt,
              category: parsed.category,
              tags: parsed.tags,
              author: parsed.author,
              publishedAt: parsed.publishedAt,
              sourceHash: parsed.sourceHash,
            },
          })
          docsAdded++
          changes.push({
            changeType: 'added',
            documentType: 'document',
            filePath: doc.path,
            title: parsed.title,
            newHash: parsed.sourceHash,
          })
        }
      }
    } catch (error) {
      console.error(`   ❌ Failed to store ${doc.path}:`, error)
    }
  }

  // Detect deleted files
  const currentPaths = documents.map(d => d.path)
  
  const deletedDocs = await prisma.document.findMany({
    where: {
      repositoryId,
      filePath: { notIn: currentPaths },
    },
  })

  const deletedBlogs = await prisma.blogPost.findMany({
    where: {
      repositoryId,
      filePath: { notIn: currentPaths },
    },
  })

  // Delete removed documents
  for (const doc of deletedDocs) {
    await prisma.document.delete({ where: { id: doc.id } })
    changes.push({
      changeType: 'deleted',
      documentType: 'document',
      filePath: doc.filePath,
      title: doc.title,
      oldHash: doc.sourceHash,
    })
  }

  for (const blog of deletedBlogs) {
    await prisma.blogPost.delete({ where: { id: blog.id } })
    changes.push({
      changeType: 'deleted',
      documentType: 'blog',
      filePath: blog.filePath,
      title: blog.title,
      oldHash: blog.sourceHash,
    })
  }

  // Record all changes
  if (changes.length > 0) {
    await prisma.documentChange.createMany({
      data: changes.map(change => ({
        syncLogId,
        changeType: change.changeType,
        documentType: change.documentType,
        filePath: change.filePath,
        title: change.title,
        oldHash: change.oldHash,
        newHash: change.newHash,
      })),
    })
  }

  console.log(`   📚 Documents: ${docsAdded} added, ${docsUpdated} updated, ${deletedDocs.length} deleted`)
  console.log(`   📝 Blog Posts: ${blogsAdded} added, ${blogsUpdated} updated, ${deletedBlogs.length} deleted`)

  return {
    docsAdded,
    docsUpdated,
    docsDeleted: deletedDocs.length,
    blogsAdded,
    blogsUpdated,
    blogsDeleted: deletedBlogs.length,
    totalAdded: docsAdded + blogsAdded,
    totalUpdated: docsUpdated + blogsUpdated,
    totalDeleted: deletedDocs.length + deletedBlogs.length,
    changes,
  }
}

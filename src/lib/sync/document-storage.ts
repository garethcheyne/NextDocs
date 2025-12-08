import { prisma } from '@/lib/db/prisma'
import { parseMarkdownDocument, isBlogPost, isDocument } from './document-parser'
import { updateDocumentSearchVector, updateBlogPostSearchVector } from '@/lib/search/indexer'

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
            // Update search index
            await updateBlogPostSearchVector(existing.id)
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
          const newBlog = await prisma.blogPost.create({
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
          // Update search index
          await updateBlogPostSearchVector(newBlog.id)
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
            // Update search index
            await updateDocumentSearchVector(existing.id)
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
          const newDoc = await prisma.document.create({
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
          // Update search index
          await updateDocumentSearchVector(newDoc.id)
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

  // Clean up orphaned categories that have no documents
  // This catches cases where entire folders are removed from the repository
  await cleanupOrphanedCategories(repositoryId)

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

async function cleanupOrphanedCategories(repositoryId: string) {
  // Get all categories for this repository
  const categories = await prisma.categoryMetadata.findMany({
    where: { repositoryId },
    select: {
      categorySlug: true,
      title: true,
    },
  })

  if (categories.length === 0) return

  // Get all document slugs for this repository
  const documents = await prisma.document.findMany({
    where: { repositoryId },
    select: { slug: true },
  })

  // Extract category paths from document slugs
  // e.g., "docs/eway/api-integration/overview" -> ["eway", "eway/api-integration"]
  const documentCategories = new Set<string>()
  for (const doc of documents) {
    const slug = doc.slug.replace(/^docs\//, '') // Remove "docs/" prefix
    const parts = slug.split('/')
    
    // Add all parent paths
    for (let i = 1; i <= parts.length; i++) {
      const categoryPath = parts.slice(0, i).join('/')
      documentCategories.add(categoryPath)
    }
  }

  // Find categories that don't have any documents under them
  const orphanedCategories = categories.filter(cat => 
    !documentCategories.has(cat.categorySlug)
  )

  if (orphanedCategories.length > 0) {
    console.log(`   🧹 Cleaning up ${orphanedCategories.length} orphaned categories...`)
    
    for (const cat of orphanedCategories) {
      await prisma.categoryMetadata.delete({
        where: {
          repositoryId_categorySlug: {
            repositoryId,
            categorySlug: cat.categorySlug,
          },
        },
      })
      console.log(`   🗑️  Removed orphaned category: ${cat.title} (${cat.categorySlug})`)
    }
  }
}

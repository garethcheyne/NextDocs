import { prisma } from '@/lib/db/prisma'
import { parseMarkdownDocument, isBlogPost, isDocument } from './document-parser'
import { updateDocumentSearchVector, updateBlogPostSearchVector } from '@/lib/search/indexer'
import { notificationCoordinator } from '@/lib/notifications'

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
  let docsSkipped = 0
  let blogsAdded = 0
  let blogsUpdated = 0
  let blogsSkipped = 0
  const changes: Change[] = []

  console.log('💾 Storing documents in database...')

  for (const doc of documents) {
    try {
      const parsed = parseMarkdownDocument(doc.path, doc.content)

      // Determine if it's a blog post or documentation
      // Default to document unless explicitly a blog post
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
                restricted: parsed.restricted,
                restrictedRoles: parsed.restrictedRoles,
                sourceHash: parsed.sourceHash,
                lastSyncedAt: new Date(),
                updatedAt: new Date(),
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
          } else {
            blogsSkipped++
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
              restricted: parsed.restricted,
              restrictedRoles: parsed.restrictedRoles,
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
      } else {
        // Store as documentation (default for non-blog files)
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
                restricted: parsed.restricted,
                restrictedRoles: parsed.restrictedRoles,
                sourceHash: parsed.sourceHash,
                lastSyncedAt: new Date(),
                updatedAt: new Date(),
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
          } else {
            docsSkipped++
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
              restricted: parsed.restricted,
              restrictedRoles: parsed.restrictedRoles,
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

  console.log(`   📚 Documents: ${docsAdded} added, ${docsUpdated} updated, ${deletedDocs.length} deleted${docsSkipped > 0 ? `, ${docsSkipped} unchanged` : ''}`)
  console.log(`   📝 Blog Posts: ${blogsAdded} added, ${blogsUpdated} updated, ${deletedBlogs.length} deleted${blogsSkipped > 0 ? `, ${blogsSkipped} unchanged` : ''}`)

  // Process releases from documents
  let releasesAdded = 0
  let releasesUpdated = 0
  let notificationsSent = 0

  for (const doc of documents) {
    try {
      const parsed = parseMarkdownDocument(doc.path, doc.content)

      if (parsed.releases && parsed.releases.length > 0) {
        for (const release of parsed.releases) {
          // Find teams by slug
          const teams = await prisma.team.findMany({
            where: {
              slug: { in: release.teams.map(t => t.toLowerCase()) },
              enabled: true,
            },
          })

          if (teams.length === 0) {
            console.warn(`   ⚠️  No valid teams found for release ${release.version} in ${doc.path}`)
            continue
          }

          // Check if release already exists
          const existingRelease = await prisma.release.findFirst({
            where: {
              version: release.version,
              filePath: doc.path,
              repositoryId,
            },
            include: { teams: true },
          })

          if (existingRelease) {
            // Update if content changed
            const contentChanged = existingRelease.content !== release.content
            const teamsChanged = existingRelease.teams.map(t => t.id).sort().join(',') !==
                                teams.map(t => t.id).sort().join(',')

            if (contentChanged || teamsChanged) {
              await prisma.release.update({
                where: { id: existingRelease.id },
                data: {
                  content: release.content,
                  teams: {
                    set: teams.map(t => ({ id: t.id })),
                  },
                  updatedAt: new Date(),
                },
              })
              releasesUpdated++
              console.log(`   📦 Updated release ${release.version} for teams: ${teams.map(t => t.slug).join(', ')}`)
            }
          } else {
            // Create new release
            const newRelease = await prisma.release.create({
              data: {
                version: release.version,
                content: release.content,
                filePath: doc.path,
                repositoryId,
                teams: {
                  connect: teams.map(t => ({ id: t.id })),
                },
              },
            })
            releasesAdded++
            console.log(`   📦 Added release ${release.version} for teams: ${teams.map(t => t.slug).join(', ')}`)

            // Send notifications for new releases
            try {
              // Get the document for the URL
              const document = await prisma.document.findFirst({
                where: { repositoryId, filePath: doc.path },
                select: { slug: true, title: true },
              })

              const result = await notificationCoordinator.notifyReleasePublished({
                releaseId: newRelease.id,
                teams: teams.map(t => t.slug),
                version: release.version,
                content: release.content,
                documentUrl: document ? `/docs/${document.slug}` : undefined,
                documentTitle: document?.title || parsed.title,
              })
              notificationsSent += result.totalSent

              // Mark release as notified (already done in coordinator)
            } catch (notifyError) {
              console.error(`   ❌ Failed to send notifications for release ${release.version}:`, notifyError)
            }
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Failed to process releases for ${doc.path}:`, error)
    }
  }

  if (releasesAdded > 0 || releasesUpdated > 0) {
    console.log(`   📦 Releases: ${releasesAdded} added, ${releasesUpdated} updated${notificationsSent > 0 ? `, ${notificationsSent} notifications sent` : ''}`)
  }

  return {
    docsAdded,
    docsUpdated,
    docsSkipped,
    docsDeleted: deletedDocs.length,
    blogsAdded,
    blogsUpdated,
    blogsSkipped,
    blogsDeleted: deletedBlogs.length,
    releasesAdded,
    releasesUpdated,
    notificationsSent,
    totalAdded: docsAdded + blogsAdded,
    totalUpdated: docsUpdated + blogsUpdated,
    totalSkipped: docsSkipped + blogsSkipped,
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

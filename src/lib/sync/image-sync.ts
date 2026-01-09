import { Octokit } from '@octokit/rest'
import { prisma } from '@/lib/db/prisma'
import { decryptToken } from '@/lib/crypto/encryption'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

interface ImageFile {
  path: string
  sha: string
  size: number
}

interface ImageSyncParams {
  source: 'github' | 'azure'
  repositoryId: string
  repositorySlug: string
  branch: string
  // GitHub params
  owner?: string
  repo?: string
  token?: string
  // Azure DevOps params
  organization?: string
  project?: string
  azureRepositoryId?: string
  patEncrypted?: string
}

/**
 * Sync images from repository to public/img directory with full lifecycle management
 * - Supports both GitHub and Azure DevOps repositories
 * - Tracks all synced images in database
 * - Updates only changed images (SHA comparison)
 * - Removes orphaned images no longer in repository
 * - Supports any image location in repo (not just _img)
 */
export async function syncRepositoryImages(
  owner: string,
  repo: string,
  token: string,
  repositoryId: string,
  repositorySlug: string,
  branch: string = 'main'
): Promise<{ synced: number; updated: number; deleted: number; skipped: number; errors: string[] }> {
  return syncRepositoryImagesUnified({
    source: 'github',
    repositoryId,
    repositorySlug,
    branch,
    owner,
    repo,
    token,
  })
}

/**
 * Unified image sync function that handles both GitHub and Azure DevOps
 */
export async function syncRepositoryImagesUnified(
  params: ImageSyncParams
): Promise<{ synced: number; updated: number; deleted: number; skipped: number; errors: string[] }> {
  const { source, repositoryId, repositorySlug } = params
  
  console.log(`\n🖼️  Syncing images from ${source.toUpperCase()} repository...`)

  const results = { synced: 0, updated: 0, deleted: 0, skipped: 0, errors: [] as string[] }

  try {
    // Fetch image files based on source
    let imageFiles: ImageFile[] = []
    
    if (source === 'github') {
      imageFiles = await fetchGitHubImages(params)
    } else if (source === 'azure') {
      imageFiles = await fetchAzureDevOpsImages(params)
    }

    console.log(`   Found ${imageFiles.length} image files in repository`)
    
    if (imageFiles.length > 0) {
      console.log(`   Processing images (showing progress every 50 files)...`)
    }

    // Get current images from database
    const existingImages = await prisma.repositoryImage.findMany({
      where: { repositoryId },
      select: { id: true, filePath: true, localPath: true, sha: true },
    })

    const existingImageMap = new Map(existingImages.map((img) => [img.filePath, img]))
    const processedPaths = new Set<string>()

    // Process each image file
    let processedCount = 0
    for (const file of imageFiles) {
      if (!file.path || !file.sha || file.size === undefined) {
        console.warn(`   ⚠️  Skipping invalid file entry: ${JSON.stringify(file)}`)
        continue
      }

      processedPaths.add(file.path)
      const existingImage = existingImageMap.get(file.path)
      processedCount++
      
      // Show progress every 50 files
      if (processedCount % 50 === 0) {
        console.log(`   📥 Processed ${processedCount}/${imageFiles.length} images...`)
      }

      try {
        // Determine local path in /public/img/
        // Format: img/{repo-slug}/{original-path}
        // Example: img/nextdocs/docs/_img/screenshot.png
        const localPath = ['img', repositorySlug, file.path].join(path.sep)
        // Build path at runtime - Turbopack can't statically analyze string array joins
        const publicDir = [process.cwd(), 'public'].join(path.sep)
        const fullLocalPath = [publicDir, localPath].join(path.sep)

        // Check if image needs syncing
        if (existingImage && existingImage.sha === file.sha) {
          // Image unchanged, just update lastSyncedAt
          await prisma.repositoryImage.update({
            where: { id: existingImage.id },
            data: { lastSyncedAt: new Date() },
          })
          results.skipped++
          continue
        }

        // Download image based on source
        let imageBuffer: Buffer
        if (source === 'github') {
          imageBuffer = await downloadGitHubImage(params, file.sha)
        } else {
          imageBuffer = await downloadAzureDevOpsImage(params, file.path)
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(fullLocalPath), { recursive: true })

        // Write file
        await fs.writeFile(fullLocalPath, imageBuffer)

        // Determine MIME type
        const mimeType = getMimeType(file.path)

        // Update or create database record
        if (existingImage) {
          await prisma.repositoryImage.update({
            where: { id: existingImage.id },
            data: {
              sha: file.sha,
              size: file.size,
              mimeType,
              localPath,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          })
          console.log(`   ✏️  Updated: ${file.path}`)
          results.updated++
        } else {
          await prisma.repositoryImage.create({
            data: {
              repositoryId,
              filePath: file.path,
              localPath,
              sha: file.sha,
              size: file.size,
              mimeType,
            },
          })
          console.log(`   ➕ Added: ${file.path}`)
          results.synced++
        }
      } catch (error) {
        const errorMsg = `Failed to sync ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`   ❌ ${errorMsg}`)
        results.errors.push(errorMsg)
      }
    }

    // Remove orphaned images (deleted from repository)
    const orphanedImages = existingImages.filter((img) => !processedPaths.has(img.filePath))
    
    for (const orphanedImage of orphanedImages) {
      try {
        // Delete file from disk
        const fullLocalPath = path.join(process.cwd(), 'public', orphanedImage.localPath)
        try {
          await fs.unlink(fullLocalPath)
        } catch (err) {
          // File might already be deleted
        }

        // Delete from database
        await prisma.repositoryImage.delete({
          where: { id: orphanedImage.id },
        })

        console.log(`   🗑️  Removed: ${orphanedImage.filePath}`)
        results.deleted++
      } catch (error) {
        const errorMsg = `Failed to remove ${orphanedImage.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`   ❌ ${errorMsg}`)
        results.errors.push(errorMsg)
      }
    }

    console.log(
      `\n✅ Image sync complete: ${results.synced} added, ${results.updated} updated, ${results.deleted} deleted, ${results.skipped} unchanged`
    )
  } catch (error) {
    console.error('❌ Image sync failed:', error)
    results.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return results
}

/**
 * Clean up all images for a repository (when repository is deleted or sync disabled)
 */
export async function cleanupRepositoryImages(repositoryId: string): Promise<number> {
  const images = await prisma.repositoryImage.findMany({
    where: { repositoryId },
    select: { id: true, localPath: true },
  })

  let cleaned = 0

  for (const image of images) {
    try {
      // Delete file from disk
      const fullLocalPath = path.join(process.cwd(), 'public', image.localPath)
      try {
        await fs.unlink(fullLocalPath)
      } catch (err) {
        // File might already be deleted
      }

      // Delete from database
      await prisma.repositoryImage.delete({
        where: { id: image.id },
      })

      cleaned++
    } catch (error) {
      console.error(`Failed to cleanup image ${image.localPath}:`, error)
    }
  }

  console.log(`🗑️  Cleaned up ${cleaned} images for repository`)
  return cleaned
}

/**
 * Fetch image files from GitHub repository
 * Only syncs images from content directories (docs, blog, api-specs)
 */
async function fetchGitHubImages(params: ImageSyncParams): Promise<ImageFile[]> {
  const { owner, repo, token, branch } = params

  if (!owner || !repo || !token) {
    throw new Error('GitHub parameters (owner, repo, token) are required')
  }

  const octokit = new Octokit({ auth: token })

  // Get all files from the repository
  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: 'true',
  })

  // Filter for image files (any location in repo)
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp']
  
  // Only include images from content directories
  const contentDirs = ['docs/', 'blog/', 'api-specs/']
  
  const imageFiles = tree.tree
    .filter(
      (item) =>
        item.type === 'blob' &&
        item.path &&
        contentDirs.some((dir) => item.path!.startsWith(dir)) &&
        imageExtensions.some((ext) => item.path!.toLowerCase().endsWith(ext))
    )
    .map((item) => ({
      path: item.path!,
      sha: item.sha!,
      size: item.size!,
    }))

  return imageFiles
}

/**
 * Fetch image files from Azure DevOps repository
 * Only syncs images from content directories (docs, blog, api-specs)
 */
async function fetchAzureDevOpsImages(params: ImageSyncParams): Promise<ImageFile[]> {
  const { organization, project, azureRepositoryId, patEncrypted } = params

  if (!organization || !project || !azureRepositoryId || !patEncrypted) {
    throw new Error('Azure DevOps parameters (organization, project, azureRepositoryId, patEncrypted) are required')
  }

  const pat = decryptToken(patEncrypted)
  const baseUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${azureRepositoryId}`
  
  // Get all files from repository
  const itemsUrl = `${baseUrl}/items?recursionLevel=Full&api-version=7.0`
  const authHeader = Buffer.from(`:${pat}`).toString('base64')
  
  const response = await fetch(itemsUrl, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Azure DevOps API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Filter for image files in content directories only
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp']
  const contentDirs = ['/docs/', '/blog/', '/api-specs/']
  const imageFiles: ImageFile[] = []

  for (const item of data.value) {
    if (
      !item.isFolder &&
      item.path &&
      contentDirs.some((dir) => item.path.startsWith(dir)) &&
      imageExtensions.some((ext) => item.path.toLowerCase().endsWith(ext))
    ) {
      // Azure DevOps uses objectId instead of sha, but we need a hash for change detection
      // We'll use the objectId as the "sha" for consistency
      imageFiles.push({
        path: item.path.startsWith('/') ? item.path.slice(1) : item.path,
        sha: item.objectId,
        size: item.size || 0,
      })
    }
  }

  return imageFiles
}

/**
 * Download image from GitHub
 */
async function downloadGitHubImage(params: ImageSyncParams, sha: string): Promise<Buffer> {
  const { owner, repo, token } = params

  if (!owner || !repo || !token) {
    throw new Error('GitHub parameters required')
  }

  const octokit = new Octokit({ auth: token })
  
  const { data: blob } = await octokit.git.getBlob({
    owner,
    repo,
    file_sha: sha,
  })

  return Buffer.from(blob.content, 'base64')
}

/**
 * Download image from Azure DevOps
 */
async function downloadAzureDevOpsImage(params: ImageSyncParams, filePath: string): Promise<Buffer> {
  const { organization, project, azureRepositoryId, patEncrypted, branch } = params

  if (!organization || !project || !azureRepositoryId || !patEncrypted) {
    throw new Error('Azure DevOps parameters required')
  }

  const pat = decryptToken(patEncrypted)
  const baseUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${azureRepositoryId}`
  
  // Ensure path starts with /
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`
  const contentUrl = `${baseUrl}/items?path=${encodeURIComponent(normalizedPath)}&versionType=Branch&version=${branch}&api-version=7.0`
  const authHeader = Buffer.from(`:${pat}`).toString('base64')
  
  const response = await fetch(contentUrl, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
  }
  return mimeTypeMap[ext] || 'application/octet-stream'
}

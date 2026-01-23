/**
 * Two-Way Sync Worker
 * Periodically checks Azure DevOps and GitHub for changes and syncs them back to The Hive
 * Handles conflict detection when both sides have changed
 */

import { prisma } from '@/lib/db/prisma'
import { decryptToken } from '@/lib/crypto/encryption'
import { marked } from 'marked'

interface ExternalWorkItem {
  id: string
  title: string
  description: string
  updatedAt: Date
  state?: string
}

/**
 * Main sync function - checks all synced features for external changes
 */
export async function syncExternalChanges(): Promise<{
  checked: number
  updated: number
  conflicts: number
  errors: number
}> {
  console.log('🔄 Starting two-way sync check...')
  
  const stats = {
    checked: 0,
    updated: 0,
    conflicts: 0,
    errors: 0
  }

  try {
    // Get all features with external sync enabled
    const features = await prisma.featureRequest.findMany({
      where: {
        syncEnabled: true,
        externalId: { not: null },
        externalType: { not: null }
      },
      include: {
        category: true
      }
    })

    console.log(`📋 Found ${features.length} features to check for external changes`)

    for (const feature of features) {
      stats.checked++
      
      try {
        if (!feature.category) {
          console.log(`⚠️ Feature ${feature.id} has no category, skipping`)
          continue
        }

        let externalItem: ExternalWorkItem | null = null

        if (feature.externalType === 'azure-devops') {
          externalItem = await fetchAzureDevOpsWorkItem(
            feature.externalId!,
            feature.category
          )
        } else if (feature.externalType === 'github') {
          externalItem = await fetchGitHubIssue(
            feature.externalId!,
            feature.category
          )
        }

        if (!externalItem) {
          console.log(`⚠️ Could not fetch external item for feature ${feature.slug}`)
          continue
        }

        // Check if external item has changed since last sync
        const externalChanged = !feature.externalUpdatedAt || 
          externalItem.updatedAt > feature.externalUpdatedAt

        const localChanged = !feature.lastSyncAt || 
          feature.localUpdatedAt > feature.lastSyncAt

        if (!externalChanged) {
          console.log(`✓ No external changes for ${feature.slug}`)
          continue
        }

        // Detect conflicts: both sides changed since last sync
        if (externalChanged && localChanged) {
          console.log(`⚠️ CONFLICT detected for ${feature.slug}`)
          await handleConflict(feature, externalItem)
          stats.conflicts++
          continue
        }

        // External changed, local hasn't - safe to update
        if (externalChanged && !localChanged) {
          console.log(`⬇️ Pulling external changes for ${feature.slug}`)
          await pullExternalChanges(feature, externalItem)
          stats.updated++
        }

      } catch (error) {
        console.error(`❌ Error syncing feature ${feature.slug}:`, error)
        stats.errors++
        
        // Update sync error status
        await prisma.featureRequest.update({
          where: { id: feature.id },
          data: {
            syncStatus: 'error',
            syncError: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    console.log(`✅ Sync complete:`, stats)
    return stats

  } catch (error) {
    console.error('❌ Fatal error in two-way sync:', error)
    throw error
  }
}

/**
 * Fetch work item from Azure DevOps
 */
async function fetchAzureDevOpsWorkItem(
  workItemId: string,
  category: any
): Promise<ExternalWorkItem | null> {
  if (!category.devopsPat || !category.devopsOrg || !category.devopsProject) {
    throw new Error('Azure DevOps configuration incomplete')
  }

  const pat = decryptToken(category.devopsPat)
  const auth = Buffer.from(`:${pat}`).toString('base64')

  const response = await fetch(
    `https://dev.azure.com/${category.devopsOrg}/${category.devopsProject}/_apis/wit/workitems/${workItemId}?api-version=7.0`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      }
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      console.log(`Work item ${workItemId} not found (may have been deleted)`)
      return null
    }
    throw new Error(`Failed to fetch work item: ${response.statusText}`)
  }

  const data = await response.json()
  const fields = data.fields

  return {
    id: workItemId,
    title: fields['System.Title'],
    description: fields['System.Description'] || '',
    updatedAt: new Date(fields['System.ChangedDate']),
    state: fields['System.State']
  }
}

/**
 * Fetch issue from GitHub
 */
async function fetchGitHubIssue(
  issueNumber: string,
  category: any
): Promise<ExternalWorkItem | null> {
  if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
    throw new Error('GitHub configuration incomplete')
  }

  const pat = decryptToken(category.githubPat)

  const response = await fetch(
    `https://api.github.com/repos/${category.githubOwner}/${category.githubRepo}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NextDocs-Integration',
      }
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      console.log(`Issue ${issueNumber} not found (may have been deleted)`)
      return null
    }
    throw new Error(`Failed to fetch issue: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    id: issueNumber,
    title: data.title,
    description: data.body || '',
    updatedAt: new Date(data.updated_at),
    state: data.state
  }
}

/**
 * Pull external changes into The Hive
 */
async function pullExternalChanges(
  feature: any,
  externalItem: ExternalWorkItem
): Promise<void> {
  // Convert HTML back to markdown if needed
  let description = externalItem.description
  if (feature.externalType === 'azure-devops' && description.includes('<')) {
    // Simple HTML to markdown conversion for common tags
    description = htmlToMarkdown(description)
  }

  await prisma.featureRequest.update({
    where: { id: feature.id },
    data: {
      title: externalItem.title,
      description: description,
      externalUpdatedAt: externalItem.updatedAt,
      lastSyncAt: new Date(),
      lastSyncedTitle: externalItem.title,
      lastSyncedDesc: description,
      syncStatus: 'synced',
      syncError: null,
      syncConflict: false
    }
  })

  console.log(`✅ Pulled changes for ${feature.slug}`)
}

/**
 * Handle conflict when both sides changed
 */
async function handleConflict(
  feature: any,
  externalItem: ExternalWorkItem
): Promise<void> {
  // Mark as conflict - requires manual resolution
  await prisma.featureRequest.update({
    where: { id: feature.id },
    data: {
      syncConflict: true,
      syncStatus: 'error',
      syncError: `Conflict detected: Both local and external versions were modified.\n\nLocal: ${feature.title}\nExternal: ${externalItem.title}\n\nPlease resolve manually.`,
      externalUpdatedAt: externalItem.updatedAt
    }
  })

  console.log(`⚠️ Conflict marked for manual resolution: ${feature.slug}`)
}

/**
 * Simple HTML to Markdown converter
 */
function htmlToMarkdown(html: string): string {
  let markdown = html
    // Headers
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    // Bold
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Code
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    // Lists
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return markdown
}

/**
 * Resolve a conflict by choosing a winner
 */
export async function resolveConflict(
  featureId: string,
  resolution: 'keep-local' | 'keep-external' | 'merge'
): Promise<void> {
  const feature = await prisma.featureRequest.findUnique({
    where: { id: featureId },
    include: { category: true }
  })

  if (!feature || !feature.syncConflict) {
    throw new Error('Feature not found or no conflict exists')
  }

  if (resolution === 'keep-local') {
    // Push local changes to external
    if (feature.externalType === 'azure-devops') {
      await updateAzureDevOpsWorkItem(feature.externalId!, feature.category!, {
        title: feature.title,
        description: feature.description
      })
    }
    // Clear conflict and update sync state
    await prisma.featureRequest.update({
      where: { id: featureId },
      data: {
        syncConflict: false,
        syncStatus: 'synced',
        syncError: null,
        lastSyncAt: new Date(),
        lastSyncedTitle: feature.title,
        lastSyncedDesc: feature.description
      }
    })
  } else if (resolution === 'keep-external') {
    // Fetch and apply external changes
    let externalItem: ExternalWorkItem | null = null
    if (feature.externalType === 'azure-devops') {
      externalItem = await fetchAzureDevOpsWorkItem(feature.externalId!, feature.category!)
    }
    if (externalItem) {
      await pullExternalChanges(feature, externalItem)
    }
  }
  // 'merge' would require manual editing and is handled separately
}

// Helper to import from devops-sync.ts to avoid duplication
async function updateAzureDevOpsWorkItem(workItemId: string, category: any, updates: any) {
  const pat = decryptToken(category.devopsPat)
  const auth = Buffer.from(`:${pat}`).toString('base64')
  
  const fields: any[] = []
  if (updates.title) fields.push({ op: 'replace', path: '/fields/System.Title', value: updates.title })
  if (updates.description) {
    const htmlDescription = marked(updates.description)
    fields.push({ op: 'replace', path: '/fields/System.Description', value: htmlDescription })
  }

  const response = await fetch(
    `https://dev.azure.com/${category.devopsOrg}/${category.devopsProject}/_apis/wit/workitems/${workItemId}?api-version=7.0`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(fields),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to update work item: ${response.statusText}`)
  }
}

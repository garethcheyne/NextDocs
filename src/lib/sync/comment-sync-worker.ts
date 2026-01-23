import { prisma } from '@/lib/db/prisma';
import { syncExternalComments } from '@/lib/sync/devops-sync';

/**
 * Background Comment Sync Worker
 * Polls GitHub and Azure DevOps for new comments every 15-30 minutes
 * Runs as a fallback to webhooks to catch any missed events
 */

const SYNC_INTERVAL_MS = parseInt(process.env.COMMENT_SYNC_INTERVAL_MINUTES || '30') * 60 * 1000;
const MAX_FEATURES_PER_BATCH = 10; // Process in batches to avoid rate limits

let isRunning = false;
let syncTimer: NodeJS.Timeout | null = null;

/**
 * Start the background comment sync worker
 */
export function startCommentSyncWorker() {
  if (isRunning) {
    console.log('Comment sync worker already running');
    return;
  }

  console.log(`Starting comment sync worker (interval: ${SYNC_INTERVAL_MS / 1000 / 60} minutes)`);
  isRunning = true;

  // Run immediately on startup
  syncAllFeatures().catch(console.error);

  // Then run on interval
  syncTimer = setInterval(() => {
    syncAllFeatures().catch(console.error);
  }, SYNC_INTERVAL_MS);
}

/**
 * Stop the background comment sync worker
 */
export function stopCommentSyncWorker() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
  isRunning = false;
  console.log('Comment sync worker stopped');
}

/**
 * Sync comments for all active features with external work items
 */
async function syncAllFeatures() {
  try {
    console.log('🔄 Starting scheduled comment sync...');
    const startTime = Date.now();

    // Find all features with external work items and comment sync enabled
    const features = await prisma.featureRequest.findMany({
      where: {
        externalId: { not: null },
        category: {
          syncComments: true,
          integrationType: { in: ['github', 'azure-devops'] },
        },
        // Only sync features that are still active (not completed/rejected)
        status: {
          notIn: ['COMPLETED', 'REJECTED'],
        },
      },
      select: {
        id: true,
        externalId: true,
        externalType: true,
        category: {
          select: {
            id: true,
            name: true,
            integrationType: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Sync most recently updated first
      },
    });

    if (features.length === 0) {
      console.log('No features to sync');
      return;
    }

    console.log(`Found ${features.length} features with external work items to sync`);

    let totalSynced = 0;
    let totalSkipped = 0;
    let totalUsersCreated = 0;
    let errors = 0;

    // Process in batches to avoid overwhelming APIs
    for (let i = 0; i < features.length; i += MAX_FEATURES_PER_BATCH) {
      const batch = features.slice(i, i + MAX_FEATURES_PER_BATCH);
      console.log(`Processing batch ${Math.floor(i / MAX_FEATURES_PER_BATCH) + 1}/${Math.ceil(features.length / MAX_FEATURES_PER_BATCH)}`);

      await Promise.all(
        batch.map(async (feature) => {
          try {
            const result = await syncExternalComments(feature.id);
            totalSynced += result.synced;
            totalSkipped += result.skipped;
            totalUsersCreated += result.created;

            if (result.synced > 0) {
              console.log(
                `✓ Synced ${result.synced} comments for feature ${feature.id} (${feature.category?.name})${result.created > 0 ? `, created ${result.created} users` : ''}`
              );
            }
          } catch (error) {
            errors++;
            console.error(`Error syncing feature ${feature.id}:`, error);
          }
        })
      );

      // Add delay between batches to respect rate limits
      if (i + MAX_FEATURES_PER_BATCH < features.length) {
        await sleep(2000); // 2 second delay between batches
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `✓ Comment sync completed in ${duration}s: ${totalSynced} synced, ${totalSkipped} skipped, ${totalUsersCreated} users created, ${errors} errors`
    );
  } catch (error) {
    console.error('Error in scheduled comment sync:', error);
  }
}

/**
 * Manually trigger a sync (useful for testing or admin actions)
 */
export async function triggerManualSync(): Promise<{
  synced: number;
  skipped: number;
  usersCreated: number;
  features: number;
}> {
  console.log('Manual sync triggered');

  const features = await prisma.featureRequest.findMany({
    where: {
      externalId: { not: null },
      category: {
        syncComments: true,
      },
    },
    select: { id: true },
  });

  let totalSynced = 0;
  let totalSkipped = 0;
  let totalUsersCreated = 0;

  for (const feature of features) {
    const result = await syncExternalComments(feature.id);
    totalSynced += result.synced;
    totalSkipped += result.skipped;
    totalUsersCreated += result.created;
  }

  return {
    synced: totalSynced,
    skipped: totalSkipped,
    usersCreated: totalUsersCreated,
    features: features.length,
  };
}

/**
 * Utility function to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

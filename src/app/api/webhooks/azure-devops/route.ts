import { NextResponse } from 'next/server';

/**
 * Azure DevOps Webhook Handler - DISABLED
 *
 * Comment syncing from Azure DevOps to NextDocs is handled by the background
 * sync worker instead of webhooks. This ensures:
 * - User identity is properly maintained
 * - No duplicate comments from webhook + polling race conditions
 * - More reliable sync without webhook configuration complexity
 *
 * The background worker runs every 30 minutes (configurable via COMMENT_SYNC_INTERVAL_MINUTES)
 * and syncs comments for all active features with external work items.
 *
 * To re-enable webhooks, restore this file from git history.
 */
export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: false,
      message: 'Azure DevOps webhooks are disabled. Comment sync is handled by background worker.',
    },
    { status: 410 } // Gone - indicates this endpoint is no longer available
  );
}

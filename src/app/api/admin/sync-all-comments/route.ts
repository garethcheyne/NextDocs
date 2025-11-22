import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { triggerManualSync } from '@/lib/sync/comment-sync-worker';

/**
 * Admin endpoint to manually trigger comment sync for all features
 * Useful for testing or forcing an immediate sync
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Admin triggered manual comment sync');
    const result = await triggerManualSync();

    return NextResponse.json({
      success: true,
      message: `Synced comments for ${result.features} features: ${result.synced} new, ${result.skipped} skipped`,
      synced: result.synced,
      skipped: result.skipped,
      features: result.features,
    });
  } catch (error) {
    console.error('Error in manual sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

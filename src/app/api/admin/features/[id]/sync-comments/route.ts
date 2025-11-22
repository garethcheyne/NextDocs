import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { syncExternalComments } from '@/lib/sync/devops-sync';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await syncExternalComments(resolvedParams.id);

    return NextResponse.json({
      success: true,
      synced: result.synced,
      skipped: result.skipped,
      message: `Synced ${result.synced} comments, skipped ${result.skipped}`,
    });
  } catch (error) {
    console.error('Error syncing comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

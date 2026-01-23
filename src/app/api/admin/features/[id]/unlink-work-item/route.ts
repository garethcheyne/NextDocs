import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * POST /api/admin/features/[id]/unlink-work-item
 * Removes the external work item reference without deleting the work item from Azure DevOps/GitHub
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    const resolvedParams = await params;

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureRequestId = resolvedParams.id;

    // Get current feature request to check if it has an external link
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId },
      select: { externalId: true, externalType: true },
    });

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    if (!featureRequest.externalId) {
      return NextResponse.json(
        { error: 'No external work item linked' },
        { status: 400 }
      );
    }

    // Remove the external references
    await prisma.featureRequest.update({
      where: { id: featureRequestId },
      data: {
        externalId: null,
        externalUrl: null,
        externalType: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Work item unlinked successfully',
    });
  } catch (error) {
    console.error('Error unlinking work item:', error);
    return NextResponse.json(
      { error: 'Failed to unlink work item' },
      { status: 500 }
    );
  }
}

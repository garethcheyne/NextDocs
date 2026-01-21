import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createWorkItemOnApproval } from '@/lib/sync/devops-sync';
import { prisma } from '@/lib/db/prisma';

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

    // Parse customization data from request body
    const body = await request.json();
    const { title, description, workItemType, tags, customFields } = body;

    // Verify feature request exists and is approved
    const feature = await prisma.featureRequest.findUnique({
      where: { id: resolvedParams.id },
      select: { status: true, externalId: true },
    });

    if (!feature) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    if (feature.status !== 'approved') {
      return NextResponse.json(
        { error: 'Feature request must be approved before creating work item' },
        { status: 400 }
      );
    }

    if (feature.externalId) {
      return NextResponse.json(
        { error: 'Work item already exists for this feature request' },
        { status: 400 }
      );
    }

    // Create work item with customization
    const result = await createWorkItemOnApproval(resolvedParams.id, {
      title,
      description,
      workItemType,
      tags,
      customFields,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      externalId: result.externalId,
      externalUrl: result.externalUrl,
    });
  } catch (error) {
    console.error('Error creating work item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

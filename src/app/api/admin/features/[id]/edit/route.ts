import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { updateExternalWorkItem } from '@/lib/sync/devops-sync';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the feature request
    const feature = await prisma.featureRequest.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: true,
      },
    });

    if (!feature) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    // Check if user is admin or creator
    const isAdmin = session.user.role === 'admin';
    const isCreator = feature.createdBy === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only admins or the creator can edit this feature' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Update the feature request
    const updatedFeature = await prisma.featureRequest.update({
      where: { id: resolvedParams.id },
      data: {
        title: title.trim(),
        description: description.trim(),
      },
    });

    // If there's an external work item, update it too
    if (feature.externalId && feature.category) {
      try {
        await updateExternalWorkItem(
          feature.externalId,
          feature.category,
          {
            title: title.trim(),
            description: description.trim(),
          }
        );
      } catch (error) {
        console.error('Failed to update external work item:', error);
        // Don't fail the whole operation if external sync fails
      }
    }

    return NextResponse.json({
      feature: updatedFeature,
      message: 'Feature request updated successfully',
    });
  } catch (error) {
    console.error('Error updating feature request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

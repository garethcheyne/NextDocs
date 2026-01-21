import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { integrationType, github, devops, syncSettings } = body;

    // Check if integration type is enabled
    if (integrationType === 'azure-devops' && process.env.DEVOPS_ENABLED !== 'true') {
      return NextResponse.json(
        { message: 'Azure DevOps integration is not enabled. Set DEVOPS_ENABLED=true in environment.' },
        { status: 400 }
      );
    }

    if (integrationType === 'github' && process.env.GITHUB_ENABLED !== 'true') {
      return NextResponse.json(
        { message: 'GitHub integration is not enabled. Set GITHUB_ENABLED=true in environment.' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      integrationType,
      syncComments: syncSettings.syncComments,
      syncStatus: syncSettings.syncStatus,
    };

    if (integrationType === 'github') {
      updateData.githubOwner = github.owner;
      updateData.githubRepo = github.repo;
    } else if (integrationType === 'azure-devops') {
      updateData.devopsProject = devops.project;
      updateData.devopsAreaPath = devops.areaPath || null;
    }

    await prisma.featureCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Integration settings saved successfully' });
  } catch (error) {
    console.error('Error saving integration settings:', error);
    return NextResponse.json(
      { message: 'Failed to save integration settings' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { encryptToken } from '@/lib/crypto/encryption';

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

    // Prepare update data
    const updateData: any = {
      integrationType,
      autoCreateOnApproval: syncSettings.autoCreateOnApproval,
      syncComments: syncSettings.syncComments,
      syncStatus: syncSettings.syncStatus,
    };

    if (integrationType === 'github') {
      updateData.githubOwner = github.owner;
      updateData.githubRepo = github.repo;
      
      // Only update PAT if provided (encrypted)
      if (github.pat) {
        updateData.githubPat = encryptToken(github.pat);
      }
    } else if (integrationType === 'azure-devops') {
      updateData.devopsOrg = devops.org;
      updateData.devopsProject = devops.project;
      updateData.devopsAreaPath = devops.areaPath || null;
      
      // Only update PAT if provided (encrypted)
      if (devops.pat) {
        updateData.devopsPat = encryptToken(devops.pat);
      }
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

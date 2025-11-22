import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { syncExternalComments } from '@/lib/sync/devops-sync';

/**
 * Azure DevOps Webhook Handler for Work Item Comments
 * Subscribes to: workitem.commented
 * 
 * Setup in Azure DevOps:
 * 1. Go to Project Settings > Service Hooks
 * 2. Create subscription: Web Hooks
 * 3. Trigger: Work item commented on
 * 4. URL: https://yourdomain.com/api/webhooks/azure-devops
 * 5. Basic authentication username: webhook
 * 6. Basic authentication password: Set AZURE_WEBHOOK_SECRET in env
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get('authorization');

    // Verify webhook authentication
    if (!verifyAzureDevOpsAuth(authHeader)) {
      console.error('Invalid Azure DevOps webhook authentication');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const eventType = payload.eventType;

    // Only process work item commented events
    if (eventType !== 'workitem.commented') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    // Extract work item ID and organization/project info
    const workItemId = payload.resource?.workItemId?.toString();
    const projectUrl = payload.resourceContainers?.project?.baseUrl;
    const collectionUrl = payload.resourceContainers?.collection?.baseUrl;

    if (!workItemId || !collectionUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse organization from collection URL
    // Format: https://dev.azure.com/{organization}
    const orgMatch = collectionUrl.match(/dev\.azure\.com\/([^\/]+)/);
    const organization = orgMatch ? orgMatch[1] : null;

    if (!organization) {
      console.error('Could not parse organization from collection URL:', collectionUrl);
      return NextResponse.json({ error: 'Invalid collection URL' }, { status: 400 });
    }

    // Find the feature request linked to this Azure DevOps work item
    const feature = await prisma.featureRequest.findFirst({
      where: {
        externalId: workItemId,
        externalType: 'azure-devops',
        category: {
          integrationType: 'azure-devops',
          devopsOrg: organization,
        },
      },
      include: {
        category: true,
      },
    });

    if (!feature) {
      console.log(`No feature request found for Azure DevOps work item #${workItemId} in ${organization}`);
      return NextResponse.json({ message: 'Feature not found' }, { status: 200 });
    }

    // Check if comment sync is enabled
    if (!feature.category?.syncComments) {
      console.log(`Comment sync disabled for feature ${feature.id}`);
      return NextResponse.json({ message: 'Sync disabled' }, { status: 200 });
    }

    // Sync comments from Azure DevOps
    console.log(`Webhook triggered: Syncing comments for feature ${feature.id} from Azure DevOps work item #${workItemId}`);
    const result = await syncExternalComments(feature.id);

    return NextResponse.json({
      success: true,
      message: `Synced ${result.synced} comments, skipped ${result.skipped}`,
      synced: result.synced,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error('Azure DevOps webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Verify Azure DevOps webhook authentication using Basic Auth
 */
function verifyAzureDevOpsAuth(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const secret = process.env.AZURE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('AZURE_WEBHOOK_SECRET not configured - webhook authentication cannot be verified');
    return true; // Allow in development if no secret configured
  }

  try {
    const base64Credentials = authHeader.substring(6); // Remove 'Basic ' prefix
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Azure DevOps sends username as 'webhook' (or custom) and password as the secret
    return password === secret;
  } catch (error) {
    console.error('Error verifying Azure DevOps auth:', error);
    return false;
  }
}

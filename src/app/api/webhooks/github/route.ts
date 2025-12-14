import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { syncExternalComments } from '@/lib/sync/devops-sync';

/**
 * GitHub Webhook Handler for Issue Comments
 * Subscribes to: issue_comment.created, issue_comment.edited
 * 
 * Setup in GitHub:
 * 1. Go to repository Settings > Webhooks > Add webhook
 * 2. Payload URL: https://yourdomain.com/api/webhooks/github
 * 3. Content type: application/json
 * 4. Secret: Set GITHUB_WEBHOOK_SECRET in env
 * 5. Events: Issue comments
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    // Verify webhook signature
    if (!verifyGitHubSignature(body, signature)) {
      console.error('Invalid GitHub webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Only process issue comment events
    if (event !== 'issue_comment') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    const payload = JSON.parse(body);
    const action = payload.action; // created, edited, deleted

    // Only sync on created or edited comments
    if (action !== 'created' && action !== 'edited') {
      return NextResponse.json({ message: 'Action ignored' }, { status: 200 });
    }

    // Extract issue number and repository info
    const issueNumber = payload.issue?.number?.toString();
    const repoOwner = payload.repository?.owner?.login;
    const repoName = payload.repository?.name;

    if (!issueNumber || !repoOwner || !repoName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the feature request linked to this GitHub issue
    const feature = await prisma.featureRequest.findFirst({
      where: {
        externalId: issueNumber,
        externalType: 'github',
        category: {
          integrationType: 'github',
          githubOwner: repoOwner,
          githubRepo: repoName,
        },
      },
      include: {
        category: true,
      },
    });

    if (!feature) {
      console.log(`No feature request found for GitHub issue #${issueNumber} in ${repoOwner}/${repoName}`);
      return NextResponse.json({ message: 'Feature not found' }, { status: 200 });
    }

    // Check if comment sync is enabled
    if (!feature.category?.syncComments) {
      console.log(`Comment sync disabled for feature ${feature.id}`);
      return NextResponse.json({ message: 'Sync disabled' }, { status: 200 });
    }

    // Sync comments from GitHub
    console.log(`Webhook triggered: Syncing comments for feature ${feature.id} from GitHub issue #${issueNumber}`);
    const result = await syncExternalComments(feature.id);

    return NextResponse.json({
      success: true,
      message: `Synced ${result.synced} comments, skipped ${result.skipped}`,
      synced: result.synced,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Verify GitHub webhook signature using HMAC SHA256
 */
function verifyGitHubSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error('GITHUB_WEBHOOK_SECRET not configured - rejecting webhook request');
    return false; // Never allow unsigned webhooks - secret MUST be configured
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

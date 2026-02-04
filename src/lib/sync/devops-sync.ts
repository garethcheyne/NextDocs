import { prisma } from '@/lib/db/prisma';
import { decryptToken } from '@/lib/crypto/encryption';
import { marked } from 'marked';
import { mentionsToDevOps, extractMentionedUserIds } from '@/lib/mentions/mention-utils';

interface CreateWorkItemResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

interface WorkItemCustomization {
  title?: string;
  description?: string;
  workItemType?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

/**
 * Create a GitHub issue from a feature request
 */
async function createGitHubIssue(
  featureRequest: any,
  category: any,
  customization?: WorkItemCustomization
): Promise<CreateWorkItemResult> {
  try {
    if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
      return { success: false, error: 'GitHub configuration incomplete' };
    }

    const pat = decryptToken(category.githubPat);
    
    // Get epic and tags if assigned
    const epic = featureRequest.epicId
      ? await prisma.epic.findUnique({ where: { id: featureRequest.epicId } })
      : null;

    const tags = featureRequest.tagIds.length > 0
      ? await prisma.tag.findMany({
          where: { id: { in: featureRequest.tagIds } },
        })
      : [];

    // Build issue body with custom description if provided
    let body = customization?.description || featureRequest.description;
    
    if (epic) {
      body += `\n\n---\n**Epic:** ${epic.title}`;
    }

    // Combine existing tags with custom tags
    const allTags = [
      ...tags.map((t) => t.githubLabel || t.name),
      ...(customization?.tags || []),
    ].filter(Boolean);

    // Create the issue
    const response = await fetch(
      `https://api.github.com/repos/${category.githubOwner}/${category.githubRepo}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'NextDocs-Integration',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: customization?.title || featureRequest.title,
          body,
          labels: allTags,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `GitHub API error: ${response.status} ${error}` };
    }

    const issue = await response.json();

    return {
      success: true,
      externalId: issue.number.toString(),
      externalUrl: issue.html_url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get Azure DevOps OAuth token using service principal
 */
async function getDevOpsAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.DEVOPS_TENANT_ID}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: process.env.DEVOPS_CLIENT_ID!,
    client_secret: process.env.DEVOPS_CLIENT_SECRET!,
    scope: '499b84ac-1321-427f-aa17-267ca6975798/.default', // Azure DevOps scope
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create an Azure DevOps work item from a feature request
 */
async function createAzureDevOpsWorkItem(
  featureRequest: any,
  category: any,
  customization?: WorkItemCustomization
): Promise<CreateWorkItemResult> {
  try {
    // Validate environment variables
    if (!process.env.DEVOPS_ORG_URL || !process.env.DEVOPS_CLIENT_ID || 
        !process.env.DEVOPS_CLIENT_SECRET || !process.env.DEVOPS_TENANT_ID) {
      return { success: false, error: 'Azure DevOps OAuth configuration missing in environment' };
    }

    // Category only needs to specify the project name
    if (!category.devopsProject) {
      return { success: false, error: 'Azure DevOps project name not configured for category' };
    }

    // Get OAuth token
    const accessToken = await getDevOpsAccessToken();
    const orgName = process.env.DEVOPS_ORG_URL!.split('/').pop(); // Extract org name from URL

    // Get epic and tags if assigned
    const epic = featureRequest.epicId
      ? await prisma.epic.findUnique({ where: { id: featureRequest.epicId } })
      : null;

    const tags = featureRequest.tagIds.length > 0
      ? await prisma.tag.findMany({
          where: { id: { in: featureRequest.tagIds } },
        })
      : [];

    // Use custom work item type or default to User Story
    const workItemType = customization?.workItemType || 'User Story';

    // Use custom description or default, convert markdown to HTML
    const descriptionMarkdown = customization?.description || featureRequest.description;
    const description = await marked(descriptionMarkdown);

    // Start with basic fields
    const fields: any[] = [
      { op: 'add', path: '/fields/System.Title', value: customization?.title || featureRequest.title },
      {
        op: 'add',
        path: '/fields/System.Description',
        value: description,
      },
      { op: 'add', path: '/fields/System.WorkItemType', value: workItemType },
    ];

    if (category.devopsAreaPath) {
      fields.push({
        op: 'add',
        path: '/fields/System.AreaPath',
        value: category.devopsAreaPath,
      });
    }

    if (featureRequest.priority) {
      const priorityMap: Record<string, number> = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
      };
      fields.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Common.Priority',
        value: priorityMap[featureRequest.priority] || 3,
      });
    }

    if (featureRequest.storyPoints) {
      fields.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
        value: featureRequest.storyPoints,
      });
    }

    // Combine existing tags with custom tags
    const allTags = [
      ...tags.map((t) => t.devopsTag || t.name),
      ...(customization?.tags || []),
    ].filter(Boolean);

    if (allTags.length > 0) {
      fields.push({
        op: 'add',
        path: '/fields/System.Tags',
        value: allTags.join('; '),
      });
    }

    // Add custom fields from the dialog
    if (customization?.customFields) {
      Object.entries(customization.customFields).forEach(([fieldName, fieldValue]) => {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          fields.push({
            op: 'add',
            path: `/fields/${fieldName}`,
            value: fieldValue,
          });
        }
      });
    }

    if (epic?.externalId) {
      // Link to parent epic if it exists in DevOps
      fields.push({
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'System.LinkTypes.Hierarchy-Reverse',
          url: `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workitems/${epic.externalId}`,
        },
      });
    }

    // Create work item
    const response = await fetch(
      `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workitems/$${encodeURIComponent(workItemType)}?api-version=7.1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(fields),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Azure DevOps API error: ${response.status} ${error}` };
    }

    const workItem = await response.json();

    return {
      success: true,
      externalId: workItem.id.toString(),
      externalUrl: workItem._links.html.href,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a work item for a feature request (manual creation by admin)
 * This function is used for manual work item creation via the UI
 */
export async function createWorkItemOnApproval(
  featureRequestId: string,
  customization?: WorkItemCustomization
): Promise<CreateWorkItemResult> {
  try {
    // Get feature request with category
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId },
      include: {
        category: true,
      },
    });

    if (!featureRequest || !featureRequest.category) {
      return { success: false, error: 'Feature request or category not found' };
    }

    const category = featureRequest.category;

    // Check if already has external work item
    if (featureRequest.externalId) {
      return { success: false, error: 'Work item already exists' };
    }

    // Create work item based on integration type
    let result: CreateWorkItemResult;

    if (category.integrationType === 'github') {
      result = await createGitHubIssue(featureRequest, category, customization);
    } else if (category.integrationType === 'azure-devops') {
      result = await createAzureDevOpsWorkItem(featureRequest, category, customization);
    } else {
      return { success: false, error: 'No integration configured' };
    }

    // Update feature request with external work item info
    if (result.success && result.externalId) {
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          externalId: result.externalId,
          externalUrl: result.externalUrl,
          externalType: category.integrationType,
        },
      });

      // Sync all existing comments to the newly created work item
      if (category.syncComments && category.integrationType === 'azure-devops') {
        try {
          await syncExistingCommentsToDevOps(featureRequestId, result.externalId, category);
        } catch (error) {
          console.error('Failed to sync existing comments:', error);
          // Don't fail the work item creation if comment sync fails
        }
      }
    } else if (result.error) {
      // Store sync error
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          syncError: result.error,
        },
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing external work item (GitHub issue or Azure DevOps work item)
 */
export async function updateExternalWorkItem(
  externalId: string,
  category: any,
  updates: { title?: string; description?: string }
): Promise<void> {
  if (category.integrationType === 'github') {
    await updateGitHubIssue(externalId, category, updates);
  } else if (category.integrationType === 'azure-devops') {
    await updateAzureDevOpsWorkItem(externalId, category, updates);
  }
}

/**
 * Update a GitHub issue
 */
async function updateGitHubIssue(
  issueNumber: string,
  category: any,
  updates: { title?: string; description?: string }
): Promise<void> {
  if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
    throw new Error('GitHub configuration incomplete');
  }

  const pat = decryptToken(category.githubPat);

  const body: any = {};
  if (updates.title) body.title = updates.title;
  if (updates.description) body.body = updates.description;

  const response = await fetch(
    `https://api.github.com/repos/${category.githubOwner}/${category.githubRepo}/issues/${issueNumber}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NextDocs-Integration',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update GitHub issue: ${error}`);
  }
}

/**
 * Update an Azure DevOps work item
 */
async function updateAzureDevOpsWorkItem(
  workItemId: string,
  category: any,
  updates: { title?: string; description?: string }
): Promise<void> {
  if (!category.devopsPat || !category.devopsOrg || !category.devopsProject) {
    throw new Error('Azure DevOps configuration incomplete');
  }

  const pat = decryptToken(category.devopsPat);
  const auth = Buffer.from(`:${pat}`).toString('base64');

  const fields: any[] = [];
  if (updates.title) {
    fields.push({ op: 'replace', path: '/fields/System.Title', value: updates.title });
  }
  if (updates.description) {
    // Convert markdown to HTML for Azure DevOps
    const { marked } = await import('marked');
    const htmlDescription = marked(updates.description);
    fields.push({ op: 'replace', path: '/fields/System.Description', value: htmlDescription });
  }

  const response = await fetch(
    `https://dev.azure.com/${encodeURIComponent(category.devopsOrg)}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workitems/${workItemId}?api-version=7.0`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(fields),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Azure DevOps work item: ${error}`);
  }
}

/**
 * Add a comment to an external work item
 */
/**
 * Convert simple HTML to Markdown for DevOps comments
 */
function htmlToMarkdown(html: string): string {
  if (!html) return '';
  
  let markdown = html;
  
  // Strip HTML tags and convert to Markdown
  markdown = markdown.replace(/<strong>([^<]+)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>([^<]+)<\/b>/g, '**$1**');
  markdown = markdown.replace(/<em>([^<]+)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>([^<]+)<\/i>/g, '*$1*');
  markdown = markdown.replace(/<code>([^<]+)<\/code>/g, '`$1`');
  markdown = markdown.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)');
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');
  markdown = markdown.replace(/<div[^>]*>/g, '');
  markdown = markdown.replace(/<\/div>/g, '\n');
  markdown = markdown.replace(/<p[^>]*>/g, '');
  markdown = markdown.replace(/<\/p>/g, '\n\n');
  markdown = markdown.replace(/<\/?(ul|ol|li)[^>]*>/g, '\n');
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  
  // Clean up multiple newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

/**
 * Convert Markdown to simple HTML for Azure DevOps
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Code inline: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  
  // Line breaks: convert double newlines to paragraphs, single to <br>
  html = html.split('\n\n').map(para => {
    const lines = para.split('\n').join('<br>');
    return `<div>${lines}</div>`;
  }).join('');
  
  return html;
}

interface AddCommentResult {
  success: boolean;
  externalCommentId?: string;
  error?: string;
}

export async function addExternalComment(
  externalId: string,
  category: any,
  commentText: string,
  authorName: string,
  authorEmail?: string,
  createdAt?: Date,
  updatedAt?: Date,
  userDevOpsToken?: string // User's own token for delegation
): Promise<AddCommentResult> {
  try {
    if (category.integrationType === 'github') {
      // GitHub supports Markdown - post directly
      const result = await addGitHubComment(externalId, category, commentText);
      return result;
    } else if (category.integrationType === 'azure-devops') {
      // Azure DevOps uses HTML - convert markdown to HTML
      const htmlComment = await marked(commentText);

      // If user has their own DevOps token, post directly as them (no attribution wrapper needed)
      if (userDevOpsToken) {
        const result = await addAzureDevOpsCommentAsUser(
          externalId,
          category,
          htmlComment,
          userDevOpsToken
        );
        return result;
      }

      // Fallback: Use service principal with author attribution in comment
      const fullComment = buildDevOpsCommentHtml(
        authorName,
        authorEmail || '',
        htmlComment,
        createdAt || new Date(),
        updatedAt || createdAt || new Date()
      );
      const result = await addAzureDevOpsComment(externalId, category, fullComment);
      return result;
    }
    return { success: false, error: 'Unknown integration type' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add a comment to a GitHub issue
 */
async function addGitHubComment(
  issueNumber: string,
  category: any,
  comment: string
): Promise<AddCommentResult> {
  if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
    return { success: false, error: 'GitHub configuration incomplete' };
  }

  const pat = decryptToken(category.githubPat);

  const response = await fetch(
    `https://api.github.com/repos/${category.githubOwner}/${category.githubRepo}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NextDocs-Integration',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: comment }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Failed to add GitHub comment: ${error}` };
  }

  const data = await response.json();
  return { success: true, externalCommentId: data.id.toString() };
}

/**
 * Add a comment to an Azure DevOps work item using the user's own token (delegation)
 * This posts the comment as the actual user, not the service principal
 */
async function addAzureDevOpsCommentAsUser(
  workItemId: string,
  category: any,
  comment: string,
  userAccessToken: string
): Promise<AddCommentResult> {
  if (!process.env.DEVOPS_ORG_URL) {
    return { success: false, error: 'Azure DevOps org URL not configured' };
  }

  if (!category.devopsProject) {
    return { success: false, error: 'Azure DevOps project name not configured for category' };
  }

  try {
    const response = await fetch(
      `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview.3`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: comment }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      // If user token fails (no DevOps access), return specific error for fallback handling
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'USER_NO_DEVOPS_ACCESS' };
      }
      return { success: false, error: `Failed to add Azure DevOps comment: ${error}` };
    }

    const data = await response.json();
    return { success: true, externalCommentId: data.id.toString() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add a comment to an Azure DevOps work item using service principal
 */
async function addAzureDevOpsComment(
  workItemId: string,
  category: any,
  comment: string
): Promise<AddCommentResult> {
  // Validate OAuth environment configuration
  if (!process.env.DEVOPS_ORG_URL || !process.env.DEVOPS_CLIENT_ID ||
      !process.env.DEVOPS_CLIENT_SECRET || !process.env.DEVOPS_TENANT_ID) {
    return { success: false, error: 'Azure DevOps OAuth configuration missing in environment' };
  }

  if (!category.devopsProject) {
    return { success: false, error: 'Azure DevOps project name not configured for category' };
  }

  // Get OAuth token
  const accessToken = await getDevOpsAccessToken();

  const response = await fetch(
    `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview.3`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: comment }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Failed to add Azure DevOps comment: ${error}` };
  }

  const data = await response.json();
  return { success: true, externalCommentId: data.id.toString() };
}

/**
 * Sync comments from external work item back to NextDocs
 */
export async function syncExternalComments(
  featureRequestId: string
): Promise<{ synced: number; skipped: number; created: number }> {
  try {
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId },
      include: { category: true },
    });

    if (!feature || !feature.externalId || !feature.category) {
      return { synced: 0, skipped: 0, created: 0 };
    }

    let externalComments: Array<{
      id: string;
      body: string;
      author: string;
      authorEmail?: string;
      createdAt: Date;
      modifiedAt?: Date;
    }> = [];

    if (feature.category.integrationType === 'github') {
      externalComments = await getGitHubComments(feature.externalId, feature.category);
    } else if (feature.category.integrationType === 'azure-devops') {
      externalComments = await getAzureDevOpsComments(feature.externalId, feature.category);
    }

    let synced = 0;
    let skipped = 0;
    let created = 0; // Track newly created users

    for (const extComment of externalComments) {
      // Check if comment already exists (by external ID)
      const existing = await prisma.featureComment.findFirst({
        where: {
          featureId: featureRequestId,
          externalCommentId: extComment.id,
        },
        include: { commentSync: true },
      });

      if (existing) {
        // Check if the comment was modified and needs updating
        if (extComment.modifiedAt && existing.commentSync) {
          const lastSynced = existing.commentSync.lastSyncedAt;
          if (extComment.modifiedAt > lastSynced) {
            // Update the local comment with edited content
            const content = feature.category.integrationType === 'azure-devops'
              ? htmlToMarkdown(extComment.body)
              : extComment.body;

            await prisma.featureComment.update({
              where: { id: existing.id },
              data: {
                content,
                updatedAt: extComment.modifiedAt,
              },
            });

            await prisma.commentSync.update({
              where: { id: existing.commentSync.id },
              data: { lastSyncedAt: new Date() },
            });

            synced++;
            continue;
          }
        }
        skipped++;
        continue;
      }

      // Look up user by email in the organization
      let user = null;
      if (extComment.authorEmail) {
        user = await prisma.user.findFirst({
          where: { email: extComment.authorEmail },
        });
      }

      // If user not found by email, try to find by display name
      if (!user) {
        user = await prisma.user.findFirst({
          where: { name: extComment.author },
        });
      }

      // If still not found, create the user (they're in the Azure AD tenant)
      if (!user && extComment.authorEmail) {
        user = await prisma.user.create({
          data: {
            email: extComment.authorEmail,
            name: extComment.author,
            role: 'user',
            provider: 'azuread', // Mark as Azure AD user
            emailVerified: new Date(),
          },
        });
        created++;
      }

      // If we still don't have a user (no email provided), skip this comment
      if (!user) {
        console.warn(`Cannot sync comment ${extComment.id}: no email provided for author ${extComment.author}`);
        skipped++;
        continue;
      }

      // Convert HTML to Markdown for DevOps comments
      const content = feature.category.integrationType === 'azure-devops'
        ? htmlToMarkdown(extComment.body)
        : extComment.body;

      // Create the comment
      const newComment = await prisma.featureComment.create({
        data: {
          featureId: featureRequestId,
          content,
          userId: user.id,
          externalCommentId: extComment.id,
          externalSource: feature.category.integrationType,
          createdAt: extComment.createdAt,
          updatedAt: extComment.modifiedAt || extComment.createdAt,
        },
      });

      // Create CommentSync record to track this sync
      await prisma.commentSync.create({
        data: {
          commentId: newComment.id,
          externalCommentId: extComment.id,
          externalType: feature.category.integrationType!,
          syncDirection: 'from-external',
          lastSyncedAt: new Date(),
        },
      });

      // Update feature comment count
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          commentCount: { increment: 1 },
          lastActivityAt: new Date(),
        },
      });

      synced++;
    }

    return { synced, skipped, created };
  } catch (error) {
    console.error('Error syncing external comments:', error);
    return { synced: 0, skipped: 0, created: 0 };
  }
}

/**
 * Get comments from a GitHub issue
 */
async function getGitHubComments(
  issueNumber: string,
  category: any
): Promise<Array<{ id: string; body: string; author: string; authorEmail?: string; createdAt: Date; modifiedAt?: Date }>> {
  if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
    return [];
  }

  const pat = decryptToken(category.githubPat);

  const response = await fetch(
    `https://api.github.com/repos/${category.githubOwner}/${category.githubRepo}/issues/${issueNumber}/comments`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NextDocs-Integration',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub comments');
  }

  const comments = await response.json();

  return comments.map((c: any) => ({
    id: c.id.toString(),
    body: c.body,
    author: c.user?.login || 'Unknown',
    authorEmail: c.user?.email || undefined,
    createdAt: new Date(c.created_at),
    modifiedAt: c.updated_at ? new Date(c.updated_at) : undefined,
  }));
}

/**
 * Get comments from an Azure DevOps work item
 */
async function getAzureDevOpsComments(
  workItemId: string,
  category: any
): Promise<Array<{ id: string; body: string; author: string; authorEmail?: string; createdAt: Date; modifiedAt?: Date }>> {
  // Validate OAuth environment configuration
  if (!process.env.DEVOPS_ORG_URL || !process.env.DEVOPS_CLIENT_ID ||
      !process.env.DEVOPS_CLIENT_SECRET || !process.env.DEVOPS_TENANT_ID) {
    return [];
  }

  if (!category.devopsProject) {
    return [];
  }

  try {
    // Get OAuth token
    const accessToken = await getDevOpsAccessToken();

    const response = await fetch(
      `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview.3`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Azure DevOps comments');
    }

    const data = await response.json();

    return (data.comments || []).map((c: any) => ({
      id: c.id.toString(),
      body: c.text,
      author: c.createdBy?.displayName || 'Unknown',
      authorEmail: c.createdBy?.uniqueName || c.createdBy?.mailAddress || undefined,
      createdAt: new Date(c.createdDate),
      modifiedAt: c.modifiedDate ? new Date(c.modifiedDate) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching Azure DevOps comments:', error);
    return [];
  }
}

/**
 * Update an existing comment in Azure DevOps using user's token (delegation)
 */
async function updateAzureDevOpsCommentAsUser(
  workItemId: string,
  commentId: string,
  category: any,
  newContent: string,
  userAccessToken: string
): Promise<AddCommentResult> {
  if (!process.env.DEVOPS_ORG_URL) {
    return { success: false, error: 'Azure DevOps org URL not configured' };
  }

  if (!category.devopsProject) {
    return { success: false, error: 'Azure DevOps project name not configured for category' };
  }

  try {
    const response = await fetch(
      `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workItems/${workItemId}/comments/${commentId}?api-version=7.0-preview.3`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newContent }),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'USER_NO_DEVOPS_ACCESS' };
      }
      const error = await response.text();
      return { success: false, error: `Failed to update Azure DevOps comment: ${error}` };
    }

    return { success: true, externalCommentId: commentId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing comment in Azure DevOps using service principal
 */
async function updateAzureDevOpsComment(
  workItemId: string,
  commentId: string,
  category: any,
  newContent: string
): Promise<AddCommentResult> {
  if (!process.env.DEVOPS_ORG_URL || !process.env.DEVOPS_CLIENT_ID ||
      !process.env.DEVOPS_CLIENT_SECRET || !process.env.DEVOPS_TENANT_ID) {
    return { success: false, error: 'Azure DevOps OAuth configuration missing in environment' };
  }

  if (!category.devopsProject) {
    return { success: false, error: 'Azure DevOps project name not configured for category' };
  }

  const accessToken = await getDevOpsAccessToken();

  const response = await fetch(
    `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workItems/${workItemId}/comments/${commentId}?api-version=7.0-preview.3`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newContent }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Failed to update Azure DevOps comment: ${error}` };
  }

  return { success: true, externalCommentId: commentId };
}

/**
 * Update an existing comment in GitHub
 */
async function updateGitHubComment(
  commentId: string,
  category: any,
  newContent: string
): Promise<AddCommentResult> {
  if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
    return { success: false, error: 'GitHub configuration incomplete' };
  }

  const pat = decryptToken(category.githubPat);

  const response = await fetch(
    `https://api.github.com/repos/${category.githubOwner}/${category.githubRepo}/issues/comments/${commentId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NextDocs-Integration',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: newContent }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Failed to update GitHub comment: ${error}` };
  }

  return { success: true, externalCommentId: commentId };
}

/**
 * Update an external comment when edited locally
 */
export async function updateExternalComment(
  localCommentId: string,
  newContent: string,
  authorName: string,
  authorEmail?: string,
  createdAt?: Date,
  updatedAt?: Date,
  userDevOpsToken?: string
): Promise<AddCommentResult> {
  try {
    // Get the comment with its sync info and feature
    const comment = await prisma.featureComment.findUnique({
      where: { id: localCommentId },
      include: {
        commentSync: true,
        feature: {
          include: { category: true },
        },
      },
    });

    if (!comment || !comment.commentSync || !comment.feature.externalId) {
      return { success: false, error: 'Comment not synced to external system' };
    }

    const category = comment.feature.category;
    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    let result: AddCommentResult;

    if (category.integrationType === 'github') {
      result = await updateGitHubComment(
        comment.commentSync.externalCommentId,
        category,
        newContent
      );
    } else if (category.integrationType === 'azure-devops') {
      const htmlComment = await marked(newContent);

      // If user has their own DevOps token, update as them
      if (userDevOpsToken) {
        result = await updateAzureDevOpsCommentAsUser(
          comment.feature.externalId,
          comment.commentSync.externalCommentId,
          category,
          htmlComment,
          userDevOpsToken
        );

        // If user token fails, fall back to service principal
        if (!result.success && result.error === 'USER_NO_DEVOPS_ACCESS') {
          const fullComment = buildDevOpsCommentHtml(
            authorName,
            authorEmail || '',
            htmlComment,
            createdAt || comment.createdAt,
            updatedAt || new Date()
          );
          result = await updateAzureDevOpsComment(
            comment.feature.externalId,
            comment.commentSync.externalCommentId,
            category,
            fullComment
          );
        }
      } else {
        // No user token - use service principal with attribution
        const fullComment = buildDevOpsCommentHtml(
          authorName,
          authorEmail || '',
          htmlComment,
          createdAt || comment.createdAt,
          updatedAt || new Date()
        );
        result = await updateAzureDevOpsComment(
          comment.feature.externalId,
          comment.commentSync.externalCommentId,
          category,
          fullComment
        );
      }
    } else {
      return { success: false, error: 'Unknown integration type' };
    }

    // Update sync timestamp
    if (result.success) {
      await prisma.commentSync.update({
        where: { id: comment.commentSync.id },
        data: { lastSyncedAt: new Date() },
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format a date for display in DevOps comments
 */
function formatCommentDate(date: Date, wasEdited: boolean, editedAt?: Date): string {
  const createdStr = date.toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (wasEdited && editedAt) {
    const editedStr = editedAt.toLocaleString('en-AU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return `${createdStr} (edited ${editedStr})`;
  }

  return createdStr;
}

/**
 * Build HTML comment text for Azure DevOps
 */
function buildDevOpsCommentHtml(
  authorName: string,
  authorEmail: string,
  content: string,
  createdAt: Date,
  updatedAt: Date
): string {
  const escapedName = escapeHtml(authorName || authorEmail);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'NextDocs';
  
  // Create mention for the author
  const authorMention = `<a href="#" data-vss-mention="version:2.0,${authorEmail}">@${escapedName}</a>`;

  return `<div>
    <strong>On Behalf of ${authorMention} (${siteName})</strong>
    <br/><br/>
    ${content}
  </div>`;
}

/**
 * Sync all existing comments from feature request to newly created Azure DevOps work item
 */
async function syncExistingCommentsToDevOps(
  featureRequestId: string,
  workItemId: string,
  category: any
): Promise<void> {
  // Get all existing comments that haven't been synced yet
  const comments = await prisma.featureComment.findMany({
    where: {
      featureId: featureRequestId,
      isDeleted: false,
      // Only sync comments that don't already have a CommentSync record
      commentSync: null,
    },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  if (comments.length === 0) {
    return;
  }

  const accessToken = await getDevOpsAccessToken();

  // Build user email map for mention conversion
  const userIds = comments.flatMap(c => extractMentionedUserIds(c.content));
  const uniqueUserIds = [...new Set(userIds)];
  const users = await prisma.user.findMany({
    where: { id: { in: uniqueUserIds } },
    select: { id: true, email: true },
  });
  const userEmailMap = new Map(users.map(u => [u.id, u.email]));

  // Add each comment to DevOps
  for (const comment of comments) {
    try {
      // Convert mentions to DevOps format, then markdown to HTML
      const contentWithDevOpsMentions = mentionsToDevOps(comment.content, userEmailMap);
      const htmlContent = await marked(contentWithDevOpsMentions);

      const commentText = buildDevOpsCommentHtml(
        comment.user.name || '',
        comment.user.email,
        htmlContent,
        comment.createdAt,
        comment.updatedAt
      );

      const response = await fetch(
        `${process.env.DEVOPS_ORG_URL}/${encodeURIComponent(category.devopsProject)}/_apis/wit/workItems/${workItemId}/comments?api-version=7.0-preview.3`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: commentText }),
        }
      );

      if (!response.ok) {
        console.error(`Failed to sync comment ${comment.id} to DevOps:`, await response.text());
        continue;
      }

      const devOpsComment = await response.json();

      // Create CommentSync record to track this sync
      await prisma.commentSync.create({
        data: {
          commentId: comment.id,
          externalCommentId: devOpsComment.id.toString(),
          externalType: 'azure-devops',
          syncDirection: 'to-external',
          lastSyncedAt: new Date(),
        },
      });

      // Update the comment with the external ID
      await prisma.featureComment.update({
        where: { id: comment.id },
        data: {
          externalCommentId: devOpsComment.id.toString(),
          externalSource: 'nextdocs', // Originated from NextDocs
        },
      });

    } catch (error) {
      console.error(`Error syncing comment ${comment.id}:`, error);
      // Continue with other comments even if one fails
    }
  }
}

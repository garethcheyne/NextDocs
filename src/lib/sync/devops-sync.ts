import { prisma } from '@/lib/db/prisma';
import { decryptToken } from '@/lib/crypto/encryption';

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

    // Use custom description or default
    const description = customization?.description || featureRequest.description;

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
          url: `${process.env.DEVOPS_ORG_URL}/${category.devopsProject}/_apis/wit/workitems/${epic.externalId}`,
        },
      });
    }

    // Create work item
    const response = await fetch(
      `${process.env.DEVOPS_ORG_URL}/${category.devopsProject}/_apis/wit/workitems/$${encodeURIComponent(workItemType)}?api-version=7.1`,
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
    fields.push({ op: 'replace', path: '/fields/System.Description', value: updates.description });
  }

  const response = await fetch(
    `https://dev.azure.com/${category.devopsOrg}/${category.devopsProject}/_apis/wit/workitems/${workItemId}?api-version=7.0`,
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

export async function addExternalComment(
  externalId: string,
  category: any,
  commentText: string,
  authorName: string,
  authorEmail?: string
): Promise<void> {
  if (category.integrationType === 'github') {
    // GitHub supports Markdown - post directly
    await addGitHubComment(externalId, category, commentText);
  } else if (category.integrationType === 'azure-devops') {
    // Azure DevOps uses HTML - convert markdown to HTML
    const htmlComment = markdownToHtml(commentText);
    await addAzureDevOpsComment(externalId, category, htmlComment, authorEmail);
  }
}

/**
 * Add a comment to a GitHub issue
 */
async function addGitHubComment(
  issueNumber: string,
  category: any,
  comment: string
): Promise<void> {
  if (!category.githubPat || !category.githubOwner || !category.githubRepo) {
    throw new Error('GitHub configuration incomplete');
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
    throw new Error(`Failed to add GitHub comment: ${error}`);
  }
}

/**
 * Add a comment to an Azure DevOps work item
 */
async function addAzureDevOpsComment(
  workItemId: string,
  category: any,
  comment: string,
  authorEmail?: string
): Promise<void> {
  // Validate OAuth environment configuration
  if (!process.env.DEVOPS_ORG_URL || !process.env.DEVOPS_CLIENT_ID || 
      !process.env.DEVOPS_CLIENT_SECRET || !process.env.DEVOPS_TENANT_ID) {
    throw new Error('Azure DevOps OAuth configuration missing in environment');
  }

  if (!category.devopsProject) {
    throw new Error('Azure DevOps project name not configured for category');
  }

  // Get OAuth token
  const accessToken = await getDevOpsAccessToken();

  const response = await fetch(
    `${process.env.DEVOPS_ORG_URL}/${category.devopsProject}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview.3`,
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
    throw new Error(`Failed to add Azure DevOps comment: ${error}`);
  }
}

/**
 * Sync comments from external work item back to NextDocs
 */
export async function syncExternalComments(
  featureRequestId: string
): Promise<{ synced: number; skipped: number }> {
  try {
    const feature = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId },
      include: { category: true },
    });

    if (!feature || !feature.externalId || !feature.category) {
      return { synced: 0, skipped: 0 };
    }

    let externalComments: Array<{ id: string; body: string; author: string; authorEmail?: string; createdAt: Date }> = [];

    if (feature.category.integrationType === 'github') {
      externalComments = await getGitHubComments(feature.externalId, feature.category);
    } else if (feature.category.integrationType === 'azure-devops') {
      externalComments = await getAzureDevOpsComments(feature.externalId, feature.category);
    }

    let synced = 0;
    let skipped = 0;

    for (const extComment of externalComments) {
      // Check if comment already exists (by external ID)
      const existing = await prisma.featureComment.findFirst({
        where: {
          featureId: featureRequestId,
          externalCommentId: extComment.id,
        },
      });

      if (existing) {
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

      // If user not found by email, try to find or create by display name
      if (!user) {
        user = await prisma.user.findFirst({
          where: { name: extComment.author },
        });

        // If still not found, create the user (they're in the org, just not in NextDocs yet)
        if (!user && extComment.authorEmail) {
          user = await prisma.user.create({
            data: {
              email: extComment.authorEmail,
              name: extComment.author,
              role: 'user',
              emailVerified: new Date(),
            },
          });
        }
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

      await prisma.featureComment.create({
        data: {
          featureId: featureRequestId,
          content,
          userId: user.id,
          externalCommentId: extComment.id,
          externalSource: feature.category.integrationType,
          createdAt: extComment.createdAt,
        },
      });

      synced++;
    }

    return { synced, skipped };
  } catch (error) {
    console.error('Error syncing external comments:', error);
    return { synced: 0, skipped: 0 };
  }
}

/**
 * Get comments from a GitHub issue
 */
async function getGitHubComments(
  issueNumber: string,
  category: any
): Promise<Array<{ id: string; body: string; author: string; authorEmail?: string; createdAt: Date }>> {
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
  }));
}

/**
 * Get comments from an Azure DevOps work item
 */
async function getAzureDevOpsComments(
  workItemId: string,
  category: any
): Promise<Array<{ id: string; body: string; author: string; authorEmail?: string; createdAt: Date }>> {
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
      `${process.env.DEVOPS_ORG_URL}/${category.devopsProject}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview.3`,
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
    }));
  } catch (error) {
    console.error('Error fetching Azure DevOps comments:', error);
    return [];
  }
}


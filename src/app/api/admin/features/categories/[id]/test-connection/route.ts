import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

// GitHub API test
async function testGitHubConnection(owner: string, repo: string, pat: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NextDocs-Integration',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `Successfully connected to ${data.full_name}`,
      };
    } else if (response.status === 404) {
      return {
        success: false,
        message: 'Repository not found. Check owner and repo name.',
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: 'Invalid or expired Personal Access Token.',
      };
    } else {
      return {
        success: false,
        message: `GitHub API error: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Azure DevOps API test
async function testAzureDevOpsConnection(org: string, project: string, pat: string) {
  try {
    const auth = Buffer.from(`:${pat}`).toString('base64');
    const response = await fetch(
      `https://dev.azure.com/${org}/${project}/_apis/wit/workitemtypes?api-version=7.0`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      return {
        success: true,
        message: `Successfully connected to ${org}/${project}`,
      };
    } else if (response.status === 404) {
      return {
        success: false,
        message: 'Organization or project not found.',
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: 'Invalid or expired Personal Access Token.',
      };
    } else {
      return {
        success: false,
        message: `Azure DevOps API error: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await params; // Await params even though we don't use id in this route
    const body = await request.json();
    const { type, github, devops } = body;

    let result;

    if (type === 'github') {
      if (!github?.owner || !github?.repo || !github?.pat) {
        return NextResponse.json(
          { message: 'Missing required GitHub fields' },
          { status: 400 }
        );
      }
      result = await testGitHubConnection(github.owner, github.repo, github.pat);
    } else if (type === 'azure-devops') {
      if (!devops?.org || !devops?.project || !devops?.pat) {
        return NextResponse.json(
          { message: 'Missing required Azure DevOps fields' },
          { status: 400 }
        );
      }
      result = await testAzureDevOpsConnection(devops.org, devops.project, devops.pat);
    } else {
      return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      { message: 'Failed to test connection' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, owner, repo, token, organization, project, repositoryId, pat, branch } = body

    if (provider === 'GITHUB') {
      if (!owner || !repo || !token) {
        return NextResponse.json(
          { success: false, error: 'Missing GitHub configuration (owner, repo, or token)' },
          { status: 200 }
        )
      }

      // Test GitHub connection
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}`
      
      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`
        
        if (response.status === 404) {
          errorMessage = 'Repository not found. Check the owner/repo name, or ensure your token has access to private repositories.'
        } else if (response.status === 401) {
          errorMessage = 'Invalid or expired GitHub token.'
        } else if (response.status === 403) {
          errorMessage = 'Token does not have permission to access this repository.'
        }
        
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 200 }
        )
      }

      const repoData = await response.json()
      
      // Optionally check if the branch exists
      const branchToCheck = branch || repoData.default_branch || 'main'
      const branchResponse = await fetch(`${baseUrl}/branches/${branchToCheck}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (!branchResponse.ok) {
        return NextResponse.json(
          { success: false, error: `Branch '${branchToCheck}' not found. Available default branch: ${repoData.default_branch}` },
          { status: 200 }
        )
      }

      // Count markdown files in the repo
      const treeResponse = await fetch(`${baseUrl}/git/trees/${branchToCheck}?recursive=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      let fileCount = 0
      if (treeResponse.ok) {
        const treeData = await treeResponse.json()
        fileCount = treeData.tree?.filter((item: any) => 
          item.type === 'blob' && (item.path.endsWith('.md') || item.path.endsWith('.mdx'))
        ).length || 0
      }

      return NextResponse.json({ 
        success: true, 
        message: `Connection successful! Found ${fileCount} markdown files.`,
        repoInfo: {
          name: repoData.name,
          fullName: repoData.full_name,
          private: repoData.private,
          defaultBranch: repoData.default_branch,
        }
      })

    } else if (provider === 'AZURE_DEVOPS') {
      if (!organization || !project || !repositoryId || !pat) {
        return NextResponse.json(
          { success: false, error: 'Missing Azure DevOps configuration' },
          { status: 200 }
        )
      }

      // Test Azure DevOps connection
      const baseUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repositoryId}`
      const authHeader = Buffer.from(`:${pat}`).toString('base64')
      
      const response = await fetch(`${baseUrl}?api-version=7.0`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        let errorMessage = `Azure DevOps API error: ${response.status} ${response.statusText}`
        
        if (response.status === 404) {
          errorMessage = 'Repository not found. Check the organization, project, and repository name.'
        } else if (response.status === 401 || response.status === 203) {
          errorMessage = 'Invalid or expired PAT token.'
        } else if (response.status === 403) {
          errorMessage = 'PAT does not have permission to access this repository.'
        }
        
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 200 }
        )
      }

      const repoData = await response.json()

      return NextResponse.json({ 
        success: true, 
        message: 'Connection successful!',
        repoInfo: {
          name: repoData.name,
          defaultBranch: repoData.defaultBranch,
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid provider' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 200 }
    )
  }
}

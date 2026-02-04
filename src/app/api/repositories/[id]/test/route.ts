import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { decryptToken } from '@/lib/crypto/encryption'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { pat: newPat, owner: newOwner, repo: newRepo, organization: newOrg, project: newProject, repositoryId: newRepoId } = body

    const repository = await prisma.repository.findUnique({
      where: { id },
    })

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    // Use new PAT if provided, otherwise use existing
    const pat = newPat || decryptToken(repository.patEncrypted!)

    // Use new location fields if provided, otherwise use existing
    const owner = newOwner !== undefined ? newOwner : repository.owner
    const repo = newRepo !== undefined ? newRepo : repository.repo
    const organization = newOrg !== undefined ? newOrg : repository.organization
    const project = newProject !== undefined ? newProject : repository.project
    const repositoryId = newRepoId !== undefined ? newRepoId : repository.repositoryId

    // Test connection based on source
    if (repository.source === 'azure') {
      const baseUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repositoryId}`
      const authHeader = Buffer.from(`:${pat}`).toString('base64')
      
      const response = await fetch(`${baseUrl}?api-version=7.0`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Azure DevOps API error: ${response.status} ${response.statusText}` },
          { status: 200 }
        )
      }

      return NextResponse.json({ success: true, message: 'Connection successful' })
    } else if (repository.source === 'github') {
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}`
      
      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `GitHub API error: ${response.status} ${response.statusText}` },
          { status: 200 }
        )
      }

      return NextResponse.json({ success: true, message: 'Connection successful' })
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported source' },
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

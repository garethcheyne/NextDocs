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

    const repository = await prisma.repository.findUnique({
      where: { id },
    })

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    const pat = decryptToken(repository.patEncrypted!)

    // Test connection based on source
    if (repository.source === 'azure') {
      const baseUrl = `https://dev.azure.com/${repository.organization}/${repository.project}/_apis/git/repositories/${repository.repositoryId}`
      const authHeader = Buffer.from(`:${pat}`).toString('base64')
      
      const response = await fetch(`${baseUrl}?api-version=7.0`, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Azure DevOps API error: ${response.status}` },
          { status: 200 }
        )
      }

      return NextResponse.json({ success: true, message: 'Connection successful' })
    } else if (repository.source === 'github') {
      const baseUrl = `https://api.github.com/repos/${repository.owner}/${repository.repo}`
      
      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `GitHub API error: ${response.status}` },
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

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { encryptToken } from '@/lib/crypto/encryption'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      provider,
      // Azure DevOps
      azureOrganization,
      azureProject,
      azureRepository,
      azurePat,
      // GitHub
      githubOwner,
      githubRepo,
      githubToken,
      // Common
      branch,
      basePath,
      syncSchedule,
    } = body

    // Validate required fields
    if (!name || !provider) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Map sync schedule to seconds
    const syncFrequencyMap: Record<string, number> = {
      HOURLY_1: 3600,
      HOURLY_6: 21600,
      HOURLY_12: 43200,
      DAILY: 86400,
      MANUAL: 0,
    }

    const syncFrequency = syncFrequencyMap[syncSchedule] || 21600

    // Create repository based on provider
    let repository
    if (provider === 'AZURE_DEVOPS') {
      if (!azureOrganization || !azureProject || !azureRepository || !azurePat) {
        return NextResponse.json({ error: 'Missing Azure DevOps configuration' }, { status: 400 })
      }

      const encryptedPat = encryptToken(azurePat)

      repository = await prisma.repository.create({
        data: {
          name,
          slug,
          source: 'azure',
          organization: azureOrganization,
          project: azureProject,
          repositoryId: azureRepository,
          branch: branch || 'main',
          basePath: basePath || '/',
          patEncrypted: encryptedPat,
          syncFrequency,
          enabled: true,
          createdBy: session.user.id,
        },
      })
    } else if (provider === 'GITHUB') {
      if (!githubOwner || !githubRepo || !githubToken) {
        return NextResponse.json({ error: 'Missing GitHub configuration' }, { status: 400 })
      }

      const encryptedToken = encryptToken(githubToken)

      repository = await prisma.repository.create({
        data: {
          name,
          slug,
          source: 'github',
          owner: githubOwner,
          repo: githubRepo,
          branch: branch || 'main',
          basePath: basePath || '/',
          patEncrypted: encryptedToken,
          syncFrequency,
          enabled: true,
          createdBy: session.user.id,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Create initial sync log
    await prisma.syncLog.create({
      data: {
        repositoryId: repository.id,
        status: 'in_progress',
        filesChanged: 0,
        filesAdded: 0,
        filesDeleted: 0,
      },
    })

    return NextResponse.json({ 
      success: true, 
      repository: {
        id: repository.id,
        name: repository.name,
        slug: repository.slug,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create repository:', error)
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repositories = await prisma.repository.findMany({
      include: {
        syncLogs: {
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
        _count: {
          select: { syncLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ repositories })
  } catch (error) {
    console.error('Failed to fetch repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}

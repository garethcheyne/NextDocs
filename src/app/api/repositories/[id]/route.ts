import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { encryptToken } from '@/lib/crypto/encryption'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const repository = await prisma.repository.findUnique({
      where: { id },
      include: {
        syncLogs: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    return NextResponse.json({ repository })
  } catch (error) {
    console.error('Failed to fetch repository:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repository' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { 
      name, 
      branch, 
      basePath, 
      syncFrequency, 
      enabled,
      pat,
      // GitHub fields
      owner,
      repo,
      // Azure fields
      organization,
      project,
      repositoryId
    } = body

    const updateData: any = {
      ...(name && { name }),
      ...(branch && { branch }),
      ...(basePath !== undefined && { basePath }),
      ...(syncFrequency !== undefined && { syncFrequency }),
      ...(enabled !== undefined && { enabled }),
      // GitHub fields
      ...(owner !== undefined && { owner }),
      ...(repo !== undefined && { repo }),
      // Azure fields
      ...(organization !== undefined && { organization }),
      ...(project !== undefined && { project }),
      ...(repositoryId !== undefined && { repositoryId }),
    }

    // Encrypt and update PAT if provided
    if (pat) {
      updateData.patEncrypted = encryptToken(pat)
    }

    const repository = await prisma.repository.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, repository })
  } catch (error) {
    console.error('Failed to update repository:', error)
    return NextResponse.json(
      { error: 'Failed to update repository' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch repository with counts before deletion
    const repository = await prisma.repository.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
            blogPosts: true,
            syncLogs: true,
            categoryMetadata: true,
            webhookEvents: true,
            images: true,
            apiSpecs: true,
          },
        },
        images: {
          select: { localPath: true },
        },
      },
    })

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    console.log(`🗑️  Deleting repository: ${repository.name} (${repository.id})`)
    console.log(`   📄 Documents: ${repository._count.documents}`)
    console.log(`   📝 Blog posts: ${repository._count.blogPosts}`)
    console.log(`   🖼️  Images: ${repository._count.images}`)
    console.log(`   📋 Sync logs: ${repository._count.syncLogs}`)
    console.log(`   📁 Categories: ${repository._count.categoryMetadata}`)
    console.log(`   🔗 Webhook events: ${repository._count.webhookEvents}`)
    console.log(`   📚 API specs: ${repository._count.apiSpecs}`)

    // Clean up physical image files
    let imagesDeleted = 0
    let imageErrors = 0
    
    if (repository.images.length > 0) {
      console.log(`   🧹 Cleaning up ${repository.images.length} image files...`)
      
      for (const image of repository.images) {
        try {
          const imagePath = path.join(process.cwd(), 'public', image.localPath)
          await fs.unlink(imagePath)
          imagesDeleted++
        } catch (err) {
          // File might not exist or already deleted
          imageErrors++
        }
      }
      
      // Try to clean up the repository's image directory
      try {
        // Use absolute path to avoid Turbopack bundling issues
        const publicDir = path.join(process.cwd(), 'public')
        const repoImageDir = path.join(publicDir, 'img', repository.slug)
        await fs.rm(repoImageDir, { recursive: true, force: true })
        console.log(`   📂 Removed image directory: /public/img/${repository.slug}`)
      } catch {
        // Directory might not exist or have other issues
      }
      
      console.log(`   ✅ Deleted ${imagesDeleted} image files (${imageErrors} errors)`)
    }

    // Delete API specs linked to this repository
    if (repository._count.apiSpecs > 0) {
      console.log(`   🗑️  Deleting ${repository._count.apiSpecs} API specs...`)
      await prisma.aPISpec.deleteMany({
        where: { repositoryId: id },
      })
    }

    // Delete repository (cascades to related records)
    await prisma.repository.delete({
      where: { id },
    })

    console.log(`✅ Repository "${repository.name}" deleted successfully`)

    return NextResponse.json({ 
      success: true,
      deleted: {
        repository: repository.name,
        documents: repository._count.documents,
        blogPosts: repository._count.blogPosts,
        images: imagesDeleted,
        syncLogs: repository._count.syncLogs,
        categories: repository._count.categoryMetadata,
        webhookEvents: repository._count.webhookEvents,
        apiSpecs: repository._count.apiSpecs,
      }
    })
  } catch (error) {
    console.error('Failed to delete repository:', error)
    return NextResponse.json(
      { error: 'Failed to delete repository' },
      { status: 500 }
    )
  }
}

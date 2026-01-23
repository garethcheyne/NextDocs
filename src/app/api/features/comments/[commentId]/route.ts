import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { updateExternalComment } from '@/lib/sync/devops-sync'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Comment is too long (max 5000 characters)' }, { status: 400 })
    }

    // Get the comment to verify ownership and check sync status
    const existingComment = await prisma.featureComment.findUnique({
      where: { id: commentId },
      include: {
        commentSync: true,
        feature: {
          include: { category: true },
        },
      },
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Only allow owner or admin to edit
    if (existingComment.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const comment = await prisma.featureComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Sync edit to external system if comment was previously synced
    if (
      existingComment.commentSync &&
      existingComment.feature.category?.syncComments
    ) {
      try {
        // Get user's DevOps token from session for delegation (if available)
        const userDevOpsToken = (session as any).devopsAccessToken as string | undefined

        await updateExternalComment(
          commentId,
          content.trim(),
          session.user.name || session.user.email || 'Unknown',
          session.user.email || undefined,
          existingComment.createdAt,
          new Date(),
          userDevOpsToken
        )
      } catch (error) {
        console.error('Failed to sync comment edit to external system:', error)
        // Don't fail the request if external sync fails
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId } = await params

    // Get the comment to verify ownership
    const existingComment = await prisma.featureComment.findUnique({
      where: { id: commentId },
      include: {
        feature: true,
      },
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Only allow owner or admin to delete
    if (existingComment.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    await prisma.featureComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    // Update feature request comment count
    await prisma.featureRequest.update({
      where: { id: existingComment.featureId },
      data: {
        commentCount: { decrement: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

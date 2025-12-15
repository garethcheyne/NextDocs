import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { notifyNewComment } from '@/lib/email/notification-service'
import { addExternalComment } from '@/lib/sync/devops-sync'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication to view comments
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const comments = await prisma.featureComment.findMany({
      where: {
        featureId: id,
        isDeleted: false,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Comment is too long (max 5000 characters)' }, { status: 400 })
    }

    const comment = await prisma.featureComment.create({
      data: {
        featureId: id,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Auto-follow the feature when user comments
    await prisma.featureFollower.upsert({
      where: {
        featureId_userId: {
          featureId: id,
          userId: session.user.id,
        },
      },
      update: {}, // No update needed if already following
      create: {
        featureId: id,
        userId: session.user.id,
      },
    })

    // Update feature request comment count and last activity
    const featureRequest = await prisma.featureRequest.update({
      where: { id },
      data: {
        commentCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
      include: {
        category: true,
      },
    })

    // Sync comment to external work item if configured
    if (
      featureRequest.externalId && 
      featureRequest.category?.syncComments &&
      featureRequest.category?.integrationType
    ) {
      try {
        await addExternalComment(
          featureRequest.externalId,
          featureRequest.category,
          content.trim(),
          session.user.name || session.user.email || 'Unknown'
        );
      } catch (error) {
        console.error('Failed to sync comment to external system:', error);
        // Don't fail the request if external sync fails
      }
    }

    // Send email notifications to followers
    notifyNewComment(id, comment.id).catch((error) => {
      console.error('Failed to send comment notifications:', error)
      // Don't fail the request if email fails
    })

    // Check for mentions and notify mentioned users
    const { notifyMentions } = await import('@/lib/email/notification-service')
    notifyMentions(id, comment.id, content.trim()).catch((error) => {
      console.error('Failed to send mention notifications:', error)
      // Don't fail the request if mention notifications fail
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

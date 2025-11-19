import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { notifyNewComment } from '@/lib/email/notification-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Update feature request comment count and last activity
    await prisma.featureRequest.update({
      where: { id },
      data: {
        commentCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    })

    // Send email notifications to followers
    notifyNewComment(id, comment.id).catch((error) => {
      console.error('Failed to send comment notifications:', error)
      // Don't fail the request if email fails
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

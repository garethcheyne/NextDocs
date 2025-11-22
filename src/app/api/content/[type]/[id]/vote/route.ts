import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await params
    const { voteType } = await request.json()

    if (!['document', 'blogpost'].includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Check if content exists
    const contentExists = type === 'document'
      ? await prisma.document.findUnique({ where: { id } })
      : await prisma.blogPost.findUnique({ where: { id } })

    if (!contentExists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Upsert vote
    const vote = await prisma.contentVote.upsert({
      where: {
        userId_contentType_contentId: {
          userId: session.user.id,
          contentType: type,
          contentId: id,
        },
      },
      update: {
        voteType,
      },
      create: {
        userId: session.user.id,
        contentType: type,
        contentId: id,
        voteType,
      },
    })

    // Get vote counts
    const votes = await prisma.contentVote.groupBy({
      by: ['voteType'],
      where: {
        contentType: type,
        contentId: id,
      },
      _count: true,
    })

    const upvotes = votes.find(v => v.voteType === 'up')?._count || 0
    const downvotes = votes.find(v => v.voteType === 'down')?._count || 0

    return NextResponse.json({
      success: true,
      vote,
      upvotes,
      downvotes,
      userVote: voteType,
    })
  } catch (error) {
    console.error('Failed to vote:', error)
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await params

    await prisma.contentVote.deleteMany({
      where: {
        userId: session.user.id,
        contentType: type,
        contentId: id,
      },
    })

    // Get updated vote counts
    const votes = await prisma.contentVote.groupBy({
      by: ['voteType'],
      where: {
        contentType: type,
        contentId: id,
      },
      _count: true,
    })

    const upvotes = votes.find(v => v.voteType === 'up')?._count || 0
    const downvotes = votes.find(v => v.voteType === 'down')?._count || 0

    return NextResponse.json({
      success: true,
      upvotes,
      downvotes,
      userVote: null,
    })
  } catch (error) {
    console.error('Failed to remove vote:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await auth()
    const { type, id } = await params

    // Get vote counts
    const votes = await prisma.contentVote.groupBy({
      by: ['voteType'],
      where: {
        contentType: type,
        contentId: id,
      },
      _count: true,
    })

    const upvotes = votes.find(v => v.voteType === 'up')?._count || 0
    const downvotes = votes.find(v => v.voteType === 'down')?._count || 0

    // Get user's vote if authenticated
    let userVote = null
    if (session?.user?.id) {
      const vote = await prisma.contentVote.findUnique({
        where: {
          userId_contentType_contentId: {
            userId: session.user.id,
            contentType: type,
            contentId: id,
          },
        },
      })
      userVote = vote?.voteType || null
    }

    return NextResponse.json({
      upvotes,
      downvotes,
      userVote,
    })
  } catch (error) {
    console.error('Failed to get votes:', error)
    return NextResponse.json(
      { error: 'Failed to get votes' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

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
    const { voteType } = body // +1 for upvote, -1 for downvote

    if (voteType !== 1 && voteType !== -1) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Check if user already voted
    const existingVote = await prisma.featureVote.findUnique({
      where: {
        featureId_userId: {
          featureId: id,
          userId: session.user.id,
        },
      },
    })

    let vote
    let voteCountChange = 0

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote - remove it
        await prisma.featureVote.delete({
          where: { id: existingVote.id },
        })
        voteCountChange = -voteType
        vote = null
      } else {
        // Different vote - update it
        vote = await prisma.featureVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        })
        voteCountChange = voteType - existingVote.voteType
      }
    } else {
      // New vote
      vote = await prisma.featureVote.create({
        data: {
          featureId: id,
          userId: session.user.id,
          voteType,
        },
      })
      voteCountChange = voteType
    }

    // Update feature request vote count
    const feature = await prisma.featureRequest.update({
      where: { id },
      data: {
        voteCount: { increment: voteCountChange },
        lastActivityAt: new Date(),
      },
      select: {
        voteCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      vote,
      voteCount: feature.voteCount,
    })
  } catch (error) {
    console.error('Failed to vote:', error)
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ vote: null })
    }

    const { id } = await params

    const vote = await prisma.featureVote.findUnique({
      where: {
        featureId_userId: {
          featureId: id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ vote })
  } catch (error) {
    console.error('Failed to get vote:', error)
    return NextResponse.json(
      { error: 'Failed to get vote' },
      { status: 500 }
    )
  }
}

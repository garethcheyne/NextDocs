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

    if (!['document', 'blogpost'].includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    // Check if content exists
    const contentExists = type === 'document'
      ? await prisma.document.findUnique({ where: { id } })
      : await prisma.blogPost.findUnique({ where: { id } })

    if (!contentExists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Create follow
    const follow = await prisma.contentFollow.upsert({
      where: {
        userId_contentType_contentId: {
          userId: session.user.id,
          contentType: type,
          contentId: id,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        contentType: type,
        contentId: id,
      },
    })

    return NextResponse.json({
      success: true,
      following: true,
      follow,
    })
  } catch (error) {
    console.error('Failed to follow:', error)
    return NextResponse.json(
      { error: 'Failed to follow' },
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

    await prisma.contentFollow.deleteMany({
      where: {
        userId: session.user.id,
        contentType: type,
        contentId: id,
      },
    })

    return NextResponse.json({
      success: true,
      following: false,
    })
  } catch (error) {
    console.error('Failed to unfollow:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow' },
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
    if (!session?.user?.id) {
      return NextResponse.json({ following: false })
    }

    const { type, id } = await params

    const follow = await prisma.contentFollow.findUnique({
      where: {
        userId_contentType_contentId: {
          userId: session.user.id,
          contentType: type,
          contentId: id,
        },
      },
    })

    return NextResponse.json({
      following: !!follow,
    })
  } catch (error) {
    console.error('Failed to check follow status:', error)
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    )
  }
}

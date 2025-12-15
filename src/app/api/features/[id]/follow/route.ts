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

    // Check if feature exists
    const feature = await prisma.featureRequest.findUnique({
      where: { id },
    })

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    // Check if already following
    const existingFollow = await prisma.featureFollower.findUnique({
      where: {
        featureId_userId: {
          featureId: id,
          userId: session.user.id,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this feature' }, { status: 400 })
    }

    // Create follow relationship
    await prisma.featureFollower.create({
      data: {
        featureId: id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, following: true })
  } catch (error) {
    console.error('Error following feature:', error)
    return NextResponse.json({ error: 'Failed to follow feature' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Remove follow relationship
    await prisma.featureFollower.delete({
      where: {
        featureId_userId: {
          featureId: id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ success: true, following: false })
  } catch (error) {
    console.error('Error unfollowing feature:', error)
    return NextResponse.json({ error: 'Failed to unfollow feature' }, { status: 500 })
  }
}
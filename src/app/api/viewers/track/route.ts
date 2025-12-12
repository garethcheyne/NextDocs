import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { page } = await request.json()
    
    if (!page || typeof page !== 'string') {
      return NextResponse.json(
        { error: 'Page URL is required' },
        { status: 400 }
      )
    }

    // Upsert viewer record (create or update lastSeen)
    await prisma.pageViewer.upsert({
      where: {
        userId_page: {
          userId: session.user.id,
          page: page,
        },
      },
      create: {
        userId: session.user.id,
        page: page,
      },
      update: {
        lastSeen: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track viewer error:', error)
    return NextResponse.json(
      { error: 'Failed to track viewer' },
      { status: 500 }
    )
  }
}
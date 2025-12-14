import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  let session: any = null
  
  try {
    session = await auth()
    
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

    // Check if user exists in database before creating PageViewer record
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    })

    if (!userExists) {
      console.error(`User with ID ${session.user.id} not found in database but exists in session`)
      return NextResponse.json(
        { error: 'User session is invalid' },
        { status: 401 }
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    
    console.error('Track viewer error:', {
      error: errorMessage,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      code: errorCode
    })
    return NextResponse.json(
      { error: 'Failed to track viewer' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

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

    const count = await prisma.categoryMetadata.count({
      where: {
        repositoryId: id,
        parentSlug: null, // Only count parent categories
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to count categories:', error)
    return NextResponse.json(
      { error: 'Failed to count categories' },
      { status: 500 }
    )
  }
}

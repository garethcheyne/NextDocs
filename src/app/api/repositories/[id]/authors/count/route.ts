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

    const authors = await prisma.document.findMany({
      where: {
        repositoryId: id,
        author: { not: null },
      },
      select: { author: true },
      distinct: ['author'],
    })

    return NextResponse.json({ count: authors.length })
  } catch (error) {
    console.error('Failed to count authors:', error)
    return NextResponse.json(
      { error: 'Failed to count authors' },
      { status: 500 }
    )
  }
}

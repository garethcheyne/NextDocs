import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const documents = await prisma.document.findMany({
      where: { repositoryId: id },
      select: {
        title: true,
        slug: true,
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({ items: documents })
  } catch (error) {
    console.error('Failed to fetch documents list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

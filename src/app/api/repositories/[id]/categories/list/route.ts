import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const categories = await prisma.categoryMetadata.findMany({
      where: {
        repositoryId: id,
        parentSlug: null, // Only parent categories
      },
      select: {
        title: true,
        categorySlug: true,
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({ items: categories })
  } catch (error) {
    console.error('Failed to fetch categories list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

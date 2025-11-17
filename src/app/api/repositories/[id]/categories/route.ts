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

    const categories = await prisma.categoryMetadata.findMany({
      where: { repositoryId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { categories } = await request.json()

    // Update order for each category
    for (let i = 0; i < categories.length; i++) {
      await prisma.categoryMetadata.update({
        where: {
          repositoryId_categorySlug: {
            repositoryId: id,
            categorySlug: categories[i].categorySlug,
          },
        },
        data: { order: i },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update categories:', error)
    return NextResponse.json(
      { error: 'Failed to update categories' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!session.user.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { categoryId } = body

    // Validate category exists if provided
    if (categoryId && categoryId !== 'none') {
      const category = await prisma.featureCategory.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
    }

    // Update the feature
    const updatedFeature = await prisma.featureRequest.update({
      where: { id },
      data: {
        categoryId: categoryId === 'none' ? null : categoryId,
        lastActivityAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    return NextResponse.json(updatedFeature)
  } catch (error) {
    console.error('Error reclassifying feature:', error)
    return NextResponse.json(
      { error: 'Failed to reclassify feature' },
      { status: 500 }
    )
  }
}
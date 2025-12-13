import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const category = await prisma.featureCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { featureRequests: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, slug, description, icon, iconBase64, color, order, enabled } = body

    // Check if slug is being changed and if it conflicts
    if (slug) {
      const existing = await prisma.featureCategory.findUnique({
        where: { slug },
      })

      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.featureCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(iconBase64 !== undefined && { iconBase64 }),
        ...(color !== undefined && { color }),
        ...(order !== undefined && { order }),
        ...(enabled !== undefined && { enabled }),
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { deleteRequests } = body // boolean flag from client

    // Check if category has feature requests
    const category = await prisma.featureCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { featureRequests: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category._count.featureRequests > 0) {
      if (deleteRequests) {
        // Delete all related feature requests first
        await prisma.$transaction([
          // Delete all votes for these requests
          prisma.featureVote.deleteMany({
            where: {
              feature: {
                categoryId: id,
              },
            },
          }),
          // Delete all comments for these requests
          prisma.featureComment.deleteMany({
            where: {
              feature: {
                categoryId: id,
              },
            },
          }),
          // Delete all status history
          prisma.featureStatusHistory.deleteMany({
            where: {
              feature: {
                categoryId: id,
              },
            },
          }),
          // Delete all feature requests
          prisma.featureRequest.deleteMany({
            where: { categoryId: id },
          }),
          // Finally delete the category
          prisma.featureCategory.delete({
            where: { id },
          }),
        ])

        return NextResponse.json({ 
          success: true, 
          deletedRequests: category._count.featureRequests 
        })
      } else {
        // Set categoryId to null (orphan them)
        await prisma.$transaction([
          prisma.featureRequest.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
          }),
          prisma.featureCategory.delete({
            where: { id },
          }),
        ])

        return NextResponse.json({ 
          success: true, 
          orphanedRequests: category._count.featureRequests 
        })
      }
    }

    // No requests, just delete the category
    await prisma.featureCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

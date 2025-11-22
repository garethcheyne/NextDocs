import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const blogPosts = await prisma.blogPost.findMany({
      where: { repositoryId: id },
      select: {
        title: true,
        slug: true,
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({ items: blogPosts })
  } catch (error) {
    console.error('Failed to fetch blog posts list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

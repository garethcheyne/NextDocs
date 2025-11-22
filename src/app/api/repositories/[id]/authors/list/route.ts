import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get distinct authors from both documents and blog posts
    const [docAuthors, blogAuthors] = await Promise.all([
      prisma.document.findMany({
        where: {
          repositoryId: id,
          author: { not: null },
        },
        select: { author: true },
        distinct: ['author'],
      }),
      prisma.blogPost.findMany({
        where: {
          repositoryId: id,
          author: { not: null },
        },
        select: { author: true },
        distinct: ['author'],
      }),
    ])

    // Combine and deduplicate authors
    const authorsSet = new Set<string>()
    docAuthors.forEach((d: any) => d.author && authorsSet.add(d.author))
    blogAuthors.forEach((b: any) => b.author && authorsSet.add(b.author))

    const authors = Array.from(authorsSet).sort()

    return NextResponse.json({ items: authors })
  } catch (error) {
    console.error('Failed to fetch authors list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

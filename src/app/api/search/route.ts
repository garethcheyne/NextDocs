// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchContent, getSearchSuggestions } from '@/lib/search/query'
import { auth } from '@/lib/auth/auth'

export async function GET(req: NextRequest) {
  // Require authentication
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') as 'search' | 'suggestions' | null
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')
  const category = searchParams.get('category') || undefined
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
  const types = searchParams.get('types')?.split(',') as Array<'document' | 'blog' | 'api-spec' | 'feature'> | undefined

  try {
    if (type === 'suggestions') {
      const suggestions = await getSearchSuggestions(query, limit)
      return NextResponse.json({ suggestions })
    }

    const results = await searchContent(query, {
      limit,
      offset,
      category,
      tags,
      types,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

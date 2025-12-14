import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'generated'
    const format = searchParams.get('format') || 'json'

    let filePath: string

    if (type === 'api-keys') {
      filePath = join(process.cwd(), 'docs', 'api', 'api-keys-swagger.yaml')
    } else {
      // Default to generated swagger
      const extension = format === 'yaml' ? 'yaml' : 'json'
      filePath = join(process.cwd(), 'docs', 'api', `generated-swagger.${extension}`)
    }

    try {
      const content = await readFile(filePath, 'utf8')
      
      const contentType = format === 'yaml' || type === 'api-keys' 
        ? 'application/x-yaml' 
        : 'application/json'

      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    } catch (fileError) {
      console.warn(`Swagger file not found: ${filePath}`)
      return NextResponse.json({ 
        error: 'API documentation not found. Run `npm run docs:generate` to generate documentation.' 
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Error serving API documentation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db/prisma'

interface RouteParams {
  params: Promise<{
    slug: string
    version: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug, version } = await params

    // Find the API spec
    const apiSpec = await prisma.aPISpec.findUnique({
      where: {
        slug_version: {
          slug,
          version,
        },
      },
    })

    if (!apiSpec || !apiSpec.enabled) {
      return NextResponse.json(
        { error: 'API specification not found' },
        { status: 404 }
      )
    }

    // Read the spec file from the content directory
    const specFilePath = path.join(process.cwd(), 'content', apiSpec.specPath)
    
    try {
      const fileContent = await readFile(specFilePath, 'utf-8')

      // Return the spec file with appropriate content type and CORS headers
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Access-Control-Allow-Origin': '*', // Allow CORS for Swagger UI/Redoc
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } catch (fileError) {
      console.error('Error reading spec file:', fileError)
      return NextResponse.json(
        { error: 'Failed to read specification file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error serving API spec:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

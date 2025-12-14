import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  
  try {
    const filePath = join(process.cwd(), 'docs', 'api', filename)
    const content = await readFile(filePath, 'utf8')
    
    const contentType = filename.endsWith('.yaml') || filename.endsWith('.yml')
      ? 'application/x-yaml'
      : 'application/json'

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        // Check authentication
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { filename } = await params
        
        if (!filename) {
            return new NextResponse('Filename required', { status: 400 })
        }

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return new NextResponse('Invalid filename', { status: 400 })
        }

        const filepath = join(process.cwd(), 'public', 'uploads', 'images', filename)
        const fileBuffer = await readFile(filepath)

        // Determine content type based on file extension
        const extension = filename.split('.').pop()?.toLowerCase()
        let contentType = 'application/octet-stream'

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg'
                break
            case 'png':
                contentType = 'image/png'
                break
            case 'gif':
                contentType = 'image/gif'
                break
            case 'webp':
                contentType = 'image/webp'
                break
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })

    } catch (error) {
        console.error('Error serving image:', error)
        return new NextResponse('Image not found', { status: 404 })
    }
}
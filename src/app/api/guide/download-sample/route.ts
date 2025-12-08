import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import archiver from 'archiver'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
    // Require authentication
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Create a new archiver instance
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        })

        // Path to guide docs
        const guideDocsPath = path.join(process.cwd(), 'docs', 'guide')

        // Check if directory exists
        if (!fs.existsSync(guideDocsPath)) {
            return NextResponse.json(
                { error: 'Guide documentation not found' },
                { status: 404 }
            )
        }

        // Add all files from guide directory
        archive.directory(guideDocsPath, 'docs')

        // Finalize the archive
        archive.finalize()

        // Convert archive stream to web stream
        const stream = Readable.toWeb(archive as any) as ReadableStream

        // Return the zip file
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="nextdocs-sample-template.zip"',
            },
        })
    } catch (error) {
        console.error('Error creating sample zip:', error)
        return NextResponse.json(
            { error: 'Failed to create sample zip' },
            { status: 500 }
        )
    }
}

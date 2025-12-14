import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

// Magic bytes (file signatures) for allowed image types
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
    'image/jpeg': [
        { bytes: [0xFF, 0xD8, 0xFF], offset: 0 }
    ],
    'image/png': [
        { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 }
    ],
    'image/gif': [
        { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], offset: 0 }, // GIF87a
        { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], offset: 0 }  // GIF89a
    ],
    'image/webp': [
        { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 } // RIFF header (WebP)
    ],
}

// Map MIME types to safe extensions
const MIME_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
}

/**
 * Validate file content against magic bytes to prevent extension spoofing
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    const signatures = MAGIC_BYTES[mimeType]
    if (!signatures) return false

    return signatures.some(sig => {
        if (buffer.length < sig.offset + sig.bytes.length) return false
        return sig.bytes.every((byte, index) => buffer[sig.offset + index] === byte)
    })
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate MIME type from Content-Type header
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
            }, { status: 400 })
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB.'
            }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validate file content matches claimed MIME type (magic byte validation)
        const normalizedMimeType = file.type === 'image/jpg' ? 'image/jpeg' : file.type
        if (!validateMagicBytes(buffer, normalizedMimeType)) {
            return NextResponse.json({
                error: 'File content does not match declared type. Possible file spoofing detected.'
            }, { status: 400 })
        }

        // Use safe extension based on MIME type (never trust user-provided extension)
        const safeExtension = MIME_TO_EXTENSION[file.type]
        if (!safeExtension) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
        }

        const filename = `${randomBytes(16).toString('hex')}.${safeExtension}`
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
        await mkdir(uploadsDir, { recursive: true })

        // Write file
        const filepath = join(uploadsDir, filename)
        await writeFile(filepath, buffer)

        // Return the URL using the API route for serving images
        const imageUrl = `/api/images/${filename}`

        return NextResponse.json({ 
            success: true, 
            url: imageUrl,
            filename: filename 
        })

    } catch (error) {
        console.error('Image upload error:', error)
        return NextResponse.json({ 
            error: 'Failed to upload image' 
        }, { status: 500 })
    }
}
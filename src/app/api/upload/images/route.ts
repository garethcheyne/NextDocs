import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

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

        // Validate file type
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

        // Generate unique filename
        const extension = file.name.split('.').pop()
        const filename = `${randomBytes(16).toString('hex')}.${extension}`
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
        await mkdir(uploadsDir, { recursive: true })

        // Write file
        const filepath = join(uploadsDir, filename)
        await writeFile(filepath, buffer)

        // Return the URL
        const imageUrl = `/uploads/images/${filename}`

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
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * Unified secure image endpoint for ALL private content.
 * Requires authentication for blogs, documentation, releases, API specs, and feature requests.
 * 
 * Usage: /api/images/secure?filename=abc123.png&contentType=feature-request&contentId=feature-id
 *        /api/images/secure?filename=abc123.png&contentType=blog&contentId=blog-slug
 *        /api/images/secure?filename=abc123.png&contentType=release&contentId=release-id
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const filename = searchParams.get('filename')
        const contentType = searchParams.get('contentType') // 'feature-request', 'blog', 'release', 'guide', 'api-spec'
        const contentId = searchParams.get('contentId')

        if (!filename) {
            return NextResponse.json(
                { error: 'Missing filename' },
                { status: 400 }
            )
        }

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        // If contentType and contentId provided, verify user has access
        if (contentType && contentId) {
            const hasAccess = await checkContentAccess(session.user.id, session.user.role, contentType, contentId, filename)
            
            if (!hasAccess) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 })
            }
        }

        // Read and serve the file
        const filepath = join(process.cwd(), 'public', 'uploads', 'images', filename)
        console.log(`[IMAGE SECURE] Attempting to read: ${filepath}`)
        
        const fileBuffer = await readFile(filepath)
        console.log(`[IMAGE SECURE] Successfully read: ${filename} (${fileBuffer.length} bytes)`)

        // Determine content type based on file extension
        const extension = filename.split('.').pop()?.toLowerCase()
        let contentTypeHeader = 'application/octet-stream'

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                contentTypeHeader = 'image/jpeg'
                break
            case 'png':
                contentTypeHeader = 'image/png'
                break
            case 'gif':
                contentTypeHeader = 'image/gif'
                break
            case 'webp':
                contentTypeHeader = 'image/webp'
                break
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentTypeHeader,
                'Cache-Control': 'private, max-age=31536000, immutable',
            },
        })

    } catch (error) {
        console.error('Error serving secure image:', error)
        return NextResponse.json(
            { error: 'Failed to serve image' },
            { status: 500 }
        )
    }
}

/**
 * Check if user has access to specific content
 * Returns true if user is creator/author, admin, or if content is public
 */
async function checkContentAccess(
    userId: string,
    userRole: string | null,
    contentType: string,
    contentId: string,
    filename: string
): Promise<boolean> {
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'

    switch (contentType) {
        case 'feature-request': {
            const feature = await prisma.featureRequest.findUnique({
                where: { id: contentId },
                select: {
                    description: true,
                    attachments: true,
                    comments: {
                        select: {
                            content: true
                        }
                    }
                }
            })

            if (!feature) return false
            
            // Any authenticated user can view feature request images
            // Check if image is in attachments array OR referenced in description OR in any comment
            const inAttachments = feature.attachments?.some(url => url.includes(filename)) ?? false
            const inDescription = feature.description?.includes(filename) ?? false
            const inComments = feature.comments?.some(comment => comment.content.includes(filename)) ?? false
            return inAttachments || inDescription || inComments
        }

        case 'blog': {
            const blog = await prisma.blogPost.findUnique({
                where: { id: contentId },
                select: {
                    content: true,
                }
            })

            if (!blog) return false
            
            // Any authenticated user can view blog images
            // Check if image is referenced in blog content
            return blog.content?.includes(filename) ?? false
        }

        case 'release': {
            const release = await prisma.release.findUnique({
                where: { id: contentId },
                select: {
                    content: true, // Releases store content as markdown, check if image is referenced
                }
            })

            if (!release) return false
            
            // Any authenticated user can view release images
            // Check if image is referenced in release content
            return release.content?.includes(filename) ?? false
        }

        case 'guide':
        case 'documentation': {
            // Documentation is private - only authenticated users can view
            // All authenticated users have access to documentation
            // (If you want role-based access, add checks here)
            return true
        }

        case 'api-spec': {
            const apiSpec = await prisma.aPISpec.findUnique({
                where: { id: contentId },
                select: {
                    specContent: true,
                }
            })

            if (!apiSpec) return false
            
            // Any authenticated user can view API spec images
            // Check if image is referenced in spec content
            return apiSpec.specContent?.includes(filename) ?? false
        }

        default:
            // Unknown content type - deny access
            return false
    }
}

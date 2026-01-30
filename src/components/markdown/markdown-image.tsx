'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Maximize2 } from 'lucide-react'

interface MarkdownImageProps {
  src: string
  alt: string
  title?: string
  repositorySlug?: string
  documentPath?: string
  contentType?: 'feature-request' | 'blog' | 'release' | 'guide' | 'documentation' | 'api-spec'
  contentId?: string
}

export function MarkdownImage({ src, alt, title, repositorySlug, documentPath, contentType, contentId }: MarkdownImageProps) {
  const [error, setError] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Determine image source type
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  const isAbsolute = src.startsWith('/')
  const isJustFilename = !isExternal && !isAbsolute && !src.includes('/')
  
  // Track if we're using secure endpoint
  let usingSecureEndpoint = false
  
  // Construct the image URL
  let imageSrc = src
  
  // If this is just a filename (from editor upload) and we have content context, use the secure endpoint
  if (isJustFilename && (contentType || contentId)) {
    const params = new URLSearchParams({ filename: src })
    
    if (contentType) params.append('contentType', contentType)
    if (contentId) params.append('contentId', contentId)
    
    imageSrc = `/api/images/secure?${params.toString()}`
    usingSecureEndpoint = true
  } else if (isJustFilename) {
    // Just a filename but no content context - assume it's an uploaded image
    // Construct secure URL without content parameters (will require auth but no content check)
    const params = new URLSearchParams({ filename: src })
    imageSrc = `/api/images/secure?${params.toString()}`
    usingSecureEndpoint = true
  } else if (isAbsolute && src.includes('/api/images/') && (contentType || contentId)) {
    // Legacy: full path - extract filename and use secure endpoint
    const filename = src.split('/').pop() || src
    const params = new URLSearchParams({ filename })
    
    if (contentType) params.append('contentType', contentType)
    if (contentId) params.append('contentId', contentId)
    
    imageSrc = `/api/images/secure?${params.toString()}`
    usingSecureEndpoint = true
  } else if (!isExternal && !isAbsolute && repositorySlug && documentPath) {
    // Relative path - resolve based on document location
    // Document path example: "docs/dynamics-365-bc/warehouse/warehouse-management"
    // Image src example: "_img/warehouse-management-img-19.jpeg"
    // Result: "/img/full-documentation-repo/docs/dynamics-365-bc/warehouse/_img/warehouse-management-img-19.jpeg"
    
    // Get directory of the document
    const documentDir = documentPath.substring(0, documentPath.lastIndexOf('/'))
    
    // Remove leading ./ or ../
    let cleanPath = src.replace(/^\.\//, '')
    
    // Handle ../ paths
    let pathParts = documentDir.split('/')
    while (cleanPath.startsWith('../')) {
      cleanPath = cleanPath.substring(3)
      pathParts.pop()
    }
    
    // Construct full path
    const basePath = pathParts.join('/')
    imageSrc = `/img/${repositorySlug}/${basePath}/${cleanPath}`
  } else if (!isExternal && !isAbsolute) {
    // Fallback for when repository context is not available
    const cleanPath = src.replace(/^\.\.\//, '').replace(/^\.\//, '')
    imageSrc = `/img/${cleanPath}`
  }

  // Handle image load to get dimensions
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
  }

  if (error) {
    return (
      <div className="my-4 p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">
          ⚠️ Image failed to load: <code className="text-xs">{src}</code>
        </p>
      </div>
    )
  }

  // For external images, secure endpoint images, or when dimensions are unknown, use regular img tag
  // Secure endpoint requires authentication headers that can't be proxied through Next.js Image Optimization
  if (isExternal || usingSecureEndpoint || !dimensions) {
    return (
      <>
        <span className="block my-6 group relative cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="relative inline-block w-full">
            <img
              src={imageSrc}
              alt={alt}
              title={title}
              onLoad={handleLoad}
              onError={() => setError(true)}
              className="max-w-full h-auto rounded-lg border shadow-sm transition-all group-hover:shadow-lg"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md p-2">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          {(alt || title) && (
            <span className="block text-sm text-muted-foreground text-center mt-2 italic">
              {title || alt}
            </span>
          )}
        </span>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
            <DialogTitle className="sr-only">{alt || 'Image'}</DialogTitle>
            <DialogDescription className="sr-only">{title || alt || 'Full screen image view'}</DialogDescription>
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={imageSrc}
                alt={alt}
                title={title}
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // For local images with known dimensions, use Next.js Image
  return (
    <>
      <span className="block my-6 group relative cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="relative inline-block w-full">
          <Image
            src={imageSrc}
            alt={alt}
            title={title}
            width={dimensions.width}
            height={dimensions.height}
            className="max-w-full h-auto rounded-lg border shadow-sm transition-all group-hover:shadow-lg"
            onError={() => setError(true)}
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md p-2">
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        {(alt || title) && (
          <span className="block text-sm text-muted-foreground text-center mt-2 italic">
            {title || alt}
          </span>
        )}
      </span>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <DialogTitle className="sr-only">{alt || 'Image'}</DialogTitle>
          <DialogDescription className="sr-only">{title || alt || 'Full screen image view'}</DialogDescription>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={imageSrc}
              alt={alt}
              title={title}
              width={dimensions.width}
              height={dimensions.height}
              className="max-w-full max-h-[90vh] object-contain"
              quality={100}
              sizes="95vw"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import Image from 'next/image'
import { useState } from 'react'

interface MarkdownImageProps {
  src: string
  alt: string
  title?: string
  repositorySlug?: string
  documentPath?: string
}

export function MarkdownImage({ src, alt, title, repositorySlug, documentPath }: MarkdownImageProps) {
  const [error, setError] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  // Determine image source type
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  const isAbsolute = src.startsWith('/')
  
  // Construct the image URL
  let imageSrc = src
  
  if (!isExternal && !isAbsolute && repositorySlug && documentPath) {
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

  // For external images or when dimensions are unknown, use regular img tag
  if (isExternal || !dimensions) {
    return (
      <span className="block my-6">
        <img
          src={imageSrc}
          alt={alt}
          title={title}
          onLoad={handleLoad}
          onError={() => setError(true)}
          className="max-w-full h-auto rounded-lg border shadow-sm"
        />
        {(alt || title) && (
          <span className="block text-sm text-muted-foreground text-center mt-2 italic">
            {title || alt}
          </span>
        )}
      </span>
    )
  }

  // For local images with known dimensions, use Next.js Image
  return (
    <span className="block my-6">
      <Image
        src={imageSrc}
        alt={alt}
        title={title}
        width={dimensions.width}
        height={dimensions.height}
        className="max-w-full h-auto rounded-lg border shadow-sm"
        onError={() => setError(true)}
        quality={90}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
      {(alt || title) && (
        <span className="block text-sm text-muted-foreground text-center mt-2 italic">
          {title || alt}
        </span>
      )}
    </span>
  )
}

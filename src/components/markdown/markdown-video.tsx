'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Maximize2 } from 'lucide-react'

interface MarkdownVideoProps {
  src: string
  title?: string
  contentType?: 'feature-request' | 'blog' | 'release' | 'guide' | 'documentation' | 'api-spec'
  contentId?: string
  controls?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  width?: string
  height?: string
}

export function MarkdownVideo({
  src,
  title,
  contentType,
  contentId,
  controls = true,
  autoplay = false,
  muted = false,
  loop = false,
  width,
  height,
}: MarkdownVideoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(false)

  // Determine video source type
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  const isAbsolute = src.startsWith('/')
  const isJustFilename = !isExternal && !isAbsolute && !src.includes('/')

  // Construct the video URL
  let videoSrc = src

  // If this is just a filename (from editor upload) and we have content context, use the secure endpoint
  if (isJustFilename && (contentType || contentId)) {
    const params = new URLSearchParams({ filename: src })

    if (contentType) params.append('contentType', contentType)
    if (contentId) params.append('contentId', contentId)

    videoSrc = `/api/videos/secure?${params.toString()}`
  } else if (isAbsolute && src.includes('/api/videos/') && (contentType || contentId)) {
    // Legacy: full path - extract filename and use secure endpoint
    const filename = src.split('/').pop() || src
    const params = new URLSearchParams({ filename })

    if (contentType) params.append('contentType', contentType)
    if (contentId) params.append('contentId', contentId)

    videoSrc = `/api/videos/secure?${params.toString()}`
  } else if (!isExternal && !isAbsolute && contentType && contentId) {
    // Relative path - treat as uploaded video reference
    const params = new URLSearchParams({ filename: src })
    params.append('contentType', contentType)
    params.append('contentId', contentId)
    videoSrc = `/api/videos/secure?${params.toString()}`
  }

  if (error) {
    return (
      <div className="relative w-full bg-muted rounded-lg p-8 text-center">
        <p className="text-sm text-destructive font-medium">⚠️ Video failed to load</p>
        <p className="text-xs text-muted-foreground mt-1">{src}</p>
      </div>
    )
  }

  const containerWidth = width || '100%'
  const containerHeight = height || 'auto'

  return (
    <div className="flex flex-col gap-2 my-4">
      <div
        className="group relative rounded-lg overflow-hidden bg-muted cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsOpen(true)}
        style={{ width: containerWidth, height: containerHeight }}
      >
        <video
          src={videoSrc}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
          style={{ pointerEvents: controls ? 'auto' : 'none' }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md p-2">
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {title && (
        <span className="block text-sm text-muted-foreground text-center italic">
          {title}
        </span>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <DialogTitle className="sr-only">{title || 'Video'}</DialogTitle>
          <DialogDescription className="sr-only">{title || 'Full screen video view'}</DialogDescription>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <video
              src={videoSrc}
              controls={true}
              autoPlay={true}
              muted={muted}
              loop={loop}
              onError={() => setError(true)}
              className="w-full h-auto max-h-[85vh] rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

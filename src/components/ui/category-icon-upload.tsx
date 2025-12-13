'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Image as ImageIcon, X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CategoryIconUploadProps {
  onImageChange: (base64Image: string | null) => void
  currentImage?: string | null
  disabled?: boolean
}

interface CropData {
  x: number
  y: number
  scale: number
}

export function CategoryIconUpload({ onImageChange, currentImage, disabled }: CategoryIconUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const drawCropPreview = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasSize = 300 // Display canvas size
    canvas.width = canvasSize
    canvas.height = canvasSize

    ctx.clearRect(0, 0, canvasSize, canvasSize)
    
    // Calculate image dimensions to maintain aspect ratio within crop area
    const imgAspect = img.naturalWidth / img.naturalHeight
    let drawWidth = canvasSize * cropData.scale
    let drawHeight = canvasSize * cropData.scale

    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect
    } else {
      drawWidth = drawHeight * imgAspect
    }

    // Center the image with crop offsets
    const offsetX = (canvasSize - drawWidth) / 2 + cropData.x
    const offsetY = (canvasSize - drawHeight) / 2 + cropData.y

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    // Draw crop circle overlay
    ctx.save()
    ctx.globalAlpha = 0.7
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Draw crop circle border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 10, 0, Math.PI * 2)
    ctx.stroke()
  }, [cropData])

  useEffect(() => {
    if (showCropDialog && originalImage) {
      drawCropPreview()
    }
  }, [cropData, showCropDialog, originalImage, drawCropPreview])

  const generateCroppedImage = useCallback((): string => {
    const img = imageRef.current
    if (!img) return ''

    const outputCanvas = document.createElement('canvas')
    const ctx = outputCanvas.getContext('2d')
    if (!ctx) return ''

    outputCanvas.width = 64
    outputCanvas.height = 64

    const canvasSize = 300
    const cropRadius = canvasSize / 2 - 10
    
    // Calculate source crop area
    const imgAspect = img.naturalWidth / img.naturalHeight
    let drawWidth = canvasSize * cropData.scale
    let drawHeight = canvasSize * cropData.scale

    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect
    } else {
      drawWidth = drawHeight * imgAspect
    }

    const offsetX = (canvasSize - drawWidth) / 2 + cropData.x
    const offsetY = (canvasSize - drawHeight) / 2 + cropData.y

    // Calculate what part of the image is visible in the crop circle
    const scaleRatio = drawWidth / img.naturalWidth
    const cropCenterX = canvasSize / 2
    const cropCenterY = canvasSize / 2
    
    const srcCenterX = (cropCenterX - offsetX) / scaleRatio
    const srcCenterY = (cropCenterY - offsetY) / scaleRatio
    const srcRadius = cropRadius / scaleRatio

    const srcX = Math.max(0, srcCenterX - srcRadius)
    const srcY = Math.max(0, srcCenterY - srcRadius)
    const srcWidth = Math.min(img.naturalWidth - srcX, srcRadius * 2)
    const srcHeight = Math.min(img.naturalHeight - srcY, srcRadius * 2)

    // Create circular clipping path
    ctx.beginPath()
    ctx.arc(32, 32, 32, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      img,
      srcX, srcY, srcWidth, srcHeight,
      0, 0, 64, 64
    )

    return outputCanvas.toDataURL('image/png')
  }, [cropData])

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    const url = URL.createObjectURL(file)
    setOriginalImage(url)
    setCropData({ x: 0, y: 0, scale: 1 })
    setShowCropDialog(true)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleImageLoad = () => {
    drawCropPreview()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    setCropData(prev => ({ ...prev, x: newX, y: newY }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setCropData(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))
  }

  const handleZoomOut = () => {
    setCropData(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))
  }

  const handleReset = () => {
    setCropData({ x: 0, y: 0, scale: 1 })
  }

  const handleCropConfirm = () => {
    setIsProcessing(true)
    try {
      const croppedImage = generateCroppedImage()
      setPreview(croppedImage)
      onImageChange(croppedImage)
      setShowCropDialog(false)
    } catch (err) {
      setError('Failed to process image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropDialog(false)
    if (originalImage) {
      URL.revokeObjectURL(originalImage)
      setOriginalImage(null)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Category Icon</Label>
        
        <div className="flex items-start gap-4">
          {/* Preview with circular display */}
          <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Category icon preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Upload controls */}
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={disabled || isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                {preview ? 'Change Image' : 'Upload Image'}
              </Button>

              {preview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Upload an image and crop it to create a 64×64 circular icon. Supports PNG, JPG, GIF (max 5MB).
            </p>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload category icon image"
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={handleCropCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Category Icon</DialogTitle>
            <DialogDescription>
              Drag to position and use zoom controls to fit your image in the circle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Crop Canvas */}
            <div className="flex justify-center">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="border rounded-lg cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  aria-label="Crop area for category icon - drag to position image"
                  role="img"
                />
                {originalImage && (
                  <img
                    ref={imageRef}
                    src={originalImage}
                    alt="Original"
                    className="hidden"
                    onLoad={handleImageLoad}
                  />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={cropData.scale <= 0.5}
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={cropData.scale >= 3}
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                aria-label="Reset crop position and zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropConfirm}
              disabled={isProcessing}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              {isProcessing ? 'Processing...' : 'Use This Crop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface IconUploadProps {
  currentIcon?: string | null
  onIconChange: (base64Icon: string | null) => void
  className?: string
}

export function IconUpload({ currentIcon, onIconChange, className }: IconUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentIcon || null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set canvas size to 64x64
        canvas.width = 64
        canvas.height = 64

        if (ctx) {
          // Clear canvas with transparent background
          ctx.clearRect(0, 0, 64, 64)
          
          // Calculate scaling to maintain aspect ratio
          const scale = Math.min(64 / img.width, 64 / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (64 - scaledWidth) / 2
          const y = (64 - scaledHeight) / 2

          // Draw the resized image
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

          // Convert to base64 (PNG format)
          const base64 = canvas.toDataURL('image/png').split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to get canvas context'))
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))

      // Create object URL for the image
      const objectUrl = URL.createObjectURL(file)
      img.src = objectUrl
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setIsProcessing(true)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB')
      }

      // Resize and convert to base64
      const base64Icon = await resizeImage(file)
      const previewUrl = `data:image/png;base64,${base64Icon}`
      
      setPreview(previewUrl)
      onIconChange(base64Icon)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
      console.error('Error processing image:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onIconChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Category Icon</Label>
      <div className="mt-2 space-y-4">
        {/* Preview */}
        {preview ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted">
              <img 
                src={preview} 
                alt="Category icon preview" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Icon preview (64x64px)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="self-start"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Processing...' : preview ? 'Change Icon' : 'Upload Icon'}
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Upload a square image that will be resized to 64x64 pixels. Supports PNG, JPG, SVG, and other image formats.
        </p>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
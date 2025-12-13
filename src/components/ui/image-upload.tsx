'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Image as ImageIcon,
    Upload,
    Link2,
    Loader2,
    X
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface ImageUploadProps {
    onImageInsert: (markdownText: string) => void
    disabled?: boolean
}

export function ImageUpload({ onImageInsert, disabled }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [altText, setAltText] = useState('')

    const handleFileSelect = async (file: File) => {
        if (!file) return

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload/images', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            const altText = file.name.split('.')[0] // Use filename without extension as default alt text
            const markdownText = `![${altText}](${result.url})`
            onImageInsert(markdownText)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleUrlInsert = () => {
        if (imageUrl.trim()) {
            const markdownText = `![${altText || 'Image'}](${imageUrl})`
            onImageInsert(markdownText)
            setImageUrl('')
            setAltText('')
            setIsDialogOpen(false)
        }
    }

    const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault()
                const file = item.getAsFile()
                if (file) {
                    await handleFileSelect(file)
                }
                break
            }
        }
    }

    return (
        <div className="flex items-center gap-1">
            {/* File Upload Button */}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                title="Upload image from device"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Upload className="w-4 h-4" />
                )}
            </Button>

            {/* URL Insert Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        title="Insert image from URL"
                    >
                        <Link2 className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Image from URL</DialogTitle>
                        <DialogDescription>
                            Enter the URL of the image you want to insert.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="alt-text">Alt Text (optional)</Label>
                            <Input
                                id="alt-text"
                                placeholder="Description of the image"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleUrlInsert}
                            disabled={!imageUrl.trim()}
                        >
                            Insert Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden File Input */}
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                title="Select image file to upload"
                aria-label="Select image file to upload"
            />

            {/* Error Display */}
            {error && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm rounded border flex items-center gap-2 min-w-max z-10">
                    <span>{error}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="h-auto p-0 hover:bg-transparent"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    )
}
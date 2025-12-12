'use client'

import { useEffect, RefObject } from 'react'

interface UseImagePasteOptions {
    onImagePaste: (markdownText: string) => void
    disabled?: boolean
}

export function useImagePaste(
    textareaRef: RefObject<HTMLTextAreaElement>, 
    { onImagePaste, disabled }: UseImagePasteOptions
) {
    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea || disabled) return

        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items
            if (!items) return

            // Check if there's an image in the clipboard
            for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault()
                    
                    const file = item.getAsFile()
                    if (!file) continue

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

                        // Generate markdown with timestamp as alt text
                        const altText = `Pasted image ${new Date().toLocaleTimeString()}`
                        const markdownText = `![${altText}](${result.url})`
                        
                        onImagePaste(markdownText)
                        
                        // Show success feedback (you can enhance this with a toast library)
                        console.log('Image pasted successfully!')
                        
                    } catch (error) {
                        console.error('Image paste error:', error)
                        // Show error feedback
                        alert('Failed to upload pasted image. Please try again.')
                    }
                    break
                }
            }
        }

        textarea.addEventListener('paste', handlePaste)
        
        return () => {
            textarea.removeEventListener('paste', handlePaste)
        }
    }, [textareaRef, onImagePaste, disabled])
}
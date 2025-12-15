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
            try {
                const items = e.clipboardData?.items
                if (!items) return

                // Check if there's an image in the clipboard
                for (const item of Array.from(items)) {
                    if (item.type.startsWith('image/')) {
                        e.preventDefault()
                        
                        const file = item.getAsFile()
                        if (!file) continue

                        console.log('Pasting image:', file.type, file.size)

                        const formData = new FormData()
                        formData.append('file', file)

                        const response = await fetch('/api/upload/images', {
                            method: 'POST',
                            body: formData,
                        })

                        if (!response.ok) {
                            const errorText = await response.text()
                            console.error('Upload error response:', errorText)
                            throw new Error(`Upload failed: ${response.status}`)
                        }

                        const result = await response.json()
                        console.log('Upload result:', result)

                        // Generate markdown with timestamp as alt text
                        const altText = `Pasted image ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                        const markdownText = `![${altText}](${result.url})`
                        
                        onImagePaste(markdownText)
                        
                        console.log('Image pasted successfully!')
                        break
                    }
                }
            } catch (error) {
                console.error('Image paste error:', error)
                alert('Failed to upload pasted image. Please try again.')
            }
        }

        // Use passive listener to prevent React warnings
        textarea.addEventListener('paste', handlePaste, { passive: false })
        
        return () => {
            textarea.removeEventListener('paste', handlePaste)
        }
    }, [textareaRef, onImagePaste, disabled])
}
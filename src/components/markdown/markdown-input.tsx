'use client'

/**
 * @deprecated Use RichTextEditor instead
 * 
 * This component is deprecated in favor of RichTextEditor which provides:
 * - WYSIWYG editing with TipTap
 * - Native image upload and paste support
 * - Better UX with real-time markdown conversion
 * - Standardized editor across the application
 * 
 * Replacement: import { RichTextEditor } from '@/components/editor/rich-text-editor'
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MarkdownToolbar } from '@/components/markdown/markdown-toolbar'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { MarkdownTemplates, type MarkdownTemplate } from '@/components/markdown/markdown-templates'
import { useMarkdownEditor } from '@/hooks/use-markdown-editor'
import { cn } from '@/lib/utils'

interface MarkdownInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    rows?: number
    maxLength?: number
    className?: string
    label?: string
    showCharCount?: boolean
    templates?: MarkdownTemplate[]
    showHelp?: boolean
    allowFullscreen?: boolean
}

export function MarkdownInput({
    value,
    onChange,
    placeholder = 'Write your content here... (Markdown supported)',
    disabled = false,
    rows = 10,
    maxLength = 10000,
    className,
    label,
    showCharCount = true,
    templates = [],
    showHelp = true,
    allowFullscreen = true,
}: MarkdownInputProps) {
    const [showPreview, setShowPreview] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const { textareaRef, handleInsert } = useMarkdownEditor(value, onChange)

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isFullscreen])

    // Prevent body scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isFullscreen])

    const normalView = (
        <div className={cn('space-y-2', className)}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                        {label}
                    </label>
                    <div className="flex gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => setShowPreview(false)}
                            className={cn(
                                'px-2 py-1 rounded transition-colors',
                                !showPreview ? 'bg-muted' : 'hover:bg-muted/50'
                            )}
                            disabled={disabled}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className={cn(
                                'px-2 py-1 rounded transition-colors',
                                showPreview ? 'bg-muted' : 'hover:bg-muted/50'
                            )}
                            disabled={disabled}
                        >
                            Preview
                        </button>
                        {allowFullscreen && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFullscreen(true)}
                                disabled={disabled}
                                className="h-auto py-1 px-2"
                            >
                                <Maximize2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {!showPreview && (
                <MarkdownToolbar onInsert={handleInsert} disabled={disabled} />
            )}

            {showPreview ? (
                <div className="p-3 border rounded-md min-h-[100px] bg-background">
                    {value ? (
                        <EnhancedMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*]:text-foreground/90 dark:[&>*]:text-foreground/90">
                            {value}
                        </EnhancedMarkdown>
                    ) : (
                        <p className="text-muted-foreground italic">Nothing to preview</p>
                    )}
                </div>
            ) : (
                <Textarea
                    ref={textareaRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    rows={rows}
                    className="resize-none font-mono"
                    maxLength={maxLength}
                />
            )}

            {showCharCount && (
                <div className="flex justify-end">
                    <span
                        className={cn(
                            'text-xs',
                            value.length > maxLength ? 'text-destructive' : 'text-muted-foreground'
                        )}
                    >
                        {value.length} / {maxLength}
                    </span>
                </div>
            )}

            {/* Show templates/help if provided */}
            {(templates.length > 0 || showHelp) && (
                <MarkdownTemplates
                    templates={templates}
                    onSelectTemplate={onChange}
                    showHelp={showHelp}
                />
            )}
        </div>
    )

    const fullscreenView = (
        <div className="fixed inset-0 z-50 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{label || 'Edit Content'}</h3>
                    {showCharCount && (
                        <span
                            className={cn(
                                'text-sm',
                                value.length > maxLength ? 'text-destructive' : 'text-muted-foreground'
                            )}
                        >
                            {value.length} / {maxLength}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <Minimize2 className="w-4 h-4 mr-2" />
                        Exit Fullscreen
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex h-[calc(100vh-3.5rem)]">
                {/* Left: Editor */}
                <div className="flex-1 flex flex-col border-r overflow-hidden">
                    <div className="flex-none p-3 border-b bg-muted/30">
                        <MarkdownToolbar onInsert={handleInsert} disabled={disabled} />
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <Textarea
                            ref={textareaRef}
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={disabled}
                            className="flex-1 resize-none font-mono w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
                            maxLength={maxLength}
                        />
                    </div>
                    {/* Templates at bottom of editor */}
                    {(templates.length > 0 || showHelp) && (
                        <div className="flex-none p-4 border-t bg-muted/30 max-h-48 overflow-y-auto">
                            <MarkdownTemplates
                                templates={templates}
                                onSelectTemplate={onChange}
                                showHelp={showHelp}
                            />
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-none h-12 px-4 border-b bg-muted/30 flex items-center">
                        <span className="text-sm font-medium">Live Preview</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                        {value ? (
                            <EnhancedMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*]:text-foreground/90 dark:[&>*]:text-foreground/90">
                                {value}
                            </EnhancedMarkdown>
                        ) : (
                            <p className="text-muted-foreground italic">Start typing to see a live preview...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {normalView}
            {isFullscreen && typeof document !== 'undefined' && createPortal(fullscreenView, document.body)}
        </>
    )
}

'use client'

import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { MarkdownToolbar } from '@/components/ui/markdown-toolbar'
import { useMarkdownEditor } from '@/hooks/use-markdown-editor'
import { EnhancedMarkdown } from '@/components/ui/enhanced-markdown'

interface CommentFormProps {
    featureId: string
}

export function CommentForm({ featureId }: CommentFormProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    const { textareaRef, handleInsert } = useMarkdownEditor(content, setContent)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session?.user) {
            router.push('/login')
            return
        }

        if (!content.trim()) {
            setError('Comment cannot be empty')
            return
        }

        if (content.length > 5000) {
            setError('Comment is too long (max 5000 characters)')
            return
        }

        setError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/features/${featureId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to post comment')
            }

            // Clear form
            setContent('')

            // Refresh the page to show the new comment
            startTransition(() => {
                router.refresh()
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to post comment')
            console.error('Comment submission error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!session?.user) {
        return (
            <Card className="bg-gray-50/40 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        Please <a href="/login" className="text-brand-orange hover:underline">sign in</a> to post a comment
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gray-50/40 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
            <form onSubmit={handleSubmit}>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="comment" className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Add a comment
                            </label>
                            <div className="flex gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(false)}
                                    className={`px-2 py-1 rounded ${!showPreview ? 'bg-muted' : ''}`}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    className={`px-2 py-1 rounded ${showPreview ? 'bg-muted' : ''}`}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {!showPreview && (
                            <MarkdownToolbar onInsert={handleInsert} disabled={isSubmitting} />
                        )}

                        {showPreview ? (
                            <div className="p-3 border rounded-md min-h-[100px]">
                                {content ? (
                                    <EnhancedMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*]:text-foreground/90 dark:[&>*]:text-foreground/90">
                                        {content}
                                    </EnhancedMarkdown>
                                ) : (
                                    <p className="text-muted-foreground italic">Nothing to preview</p>
                                )}
                            </div>
                        ) : (
                            <Textarea
                                ref={textareaRef}
                                id="comment"
                                placeholder="Share your thoughts, ask questions, or provide feedback... 

💡 Tip: You can paste images directly from your clipboard (Ctrl+V)!"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isSubmitting || isPending}
                                rows={4}
                                className="resize-none font-mono"
                            />
                        )}

                        <div className="flex justify-between items-center">
                            <span className={`text-xs ${content.length > 5000 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {content.length} / 5000
                            </span>
                            {error && (
                                <span className="text-sm text-red-600">{error}</span>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        disabled={!content.trim() || content.length > 5000 || isSubmitting || isPending}
                        className="ml-auto"
                    >
                        {isSubmitting || isPending ? 'Posting...' : 'Post Comment'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

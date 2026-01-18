'use client'

import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { commentTemplates } from '@/lib/markdown-templates'

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
            <Card >
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        Please <a href="/login" className="text-brand-orange hover:underline">sign in</a> to post a comment
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card >
            <form onSubmit={handleSubmit}>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <label htmlFor="comment" className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Add a comment
                        </label>

                        <MarkdownInput
                            value={content}
                            onChange={setContent}
                            placeholder="Share your thoughts, ask questions, or provide feedback...

💡 Tip: You can paste images directly from your clipboard (Ctrl+V)!"
                            disabled={isSubmitting || isPending}
                            rows={4}
                            maxLength={5000}
                            showCharCount={true}
                            templates={commentTemplates}
                            showHelp={true}
                        />

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
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

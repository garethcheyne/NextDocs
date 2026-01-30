'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Pencil, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownToolbar } from '@/components/markdown/markdown-toolbar'
import { useMarkdownEditor } from '@/hooks/use-markdown-editor'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { AuthorDisplay } from '@/components/ui/author-display'
import ReactMarkdown from 'react-markdown'
import { formatDate, formatTime } from '@/lib/utils/date-format'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CommentItemProps {
    comment: {
        id: string
        content: string
        createdAt: Date
        updatedAt: Date
        userId: string
        user?: {
            id: string
            name: string | null
            email: string | null
            image: string | null
        } | null
    }
    featureId?: string
}

export function CommentItem({ comment, featureId }: CommentItemProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const { textareaRef, handleInsert } = useMarkdownEditor(editContent, setEditContent)

    const isOwner = session?.user?.id === comment.userId
    const isAdmin = session?.user?.role === 'admin'
    const canEdit = isOwner || isAdmin
    const isEdited = new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime()

    const handleEdit = async () => {
        if (!editContent.trim() || editContent.length > 5000) {
            setError('Invalid comment content')
            return
        }

        setError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/features/comments/${comment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update comment')
            }

            setIsEditing(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update comment')
            console.error('Comment update error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/features/comments/${comment.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete comment')
            }

            setDeleteDialogOpen(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete comment')
            console.error('Comment delete error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditContent(comment.content)
        setShowPreview(false)
        setError(null)
    }

    return (
        <div className="py-4 border-b border-muted/50 last:border-b-0">
            {/* Comment Content First */}
            {isEditing ? (
                <div className="space-y-2 mb-3">
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

                    {!showPreview && (
                        <MarkdownToolbar onInsert={handleInsert} disabled={isSubmitting} />
                    )}

                    {showPreview ? (
                        <div className="p-3 border rounded-md min-h-[100px]">
                            <EnhancedMarkdown className="prose prose-sm max-w-none dark:prose-invert" contentType="feature-request" contentId={featureId}>
                                {editContent}
                            </EnhancedMarkdown>
                        </div>
                    ) : (
                        <Textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            disabled={isSubmitting}
                            rows={4}
                            className="resize-none font-mono"
                            placeholder="Edit your comment..."
                        />
                    )}

                    <div className="flex justify-between items-center">
                        <span className={`text-xs ${editContent.length > 5000 ? 'text-red-600 dark:text-red-400' : 'text-foreground/60 dark:text-foreground/70'}`}>
                            {editContent.length} / 5000
                        </span>
                        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleEdit}
                            disabled={!editContent.trim() || editContent.length > 5000 || isSubmitting}
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="mb-3">
                    <EnhancedMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*]:text-foreground/90 dark:[&>*]:text-foreground/90" contentType="feature-request" contentId={featureId}>
                        {comment.content}
                    </EnhancedMarkdown>
                </div>
            )}

            {/* User Info and Actions on Same Line */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <AuthorDisplay 
                        author={{
                            name: comment.user?.name || 'Anonymous',
                            email: comment.user?.email || undefined,
                            image: comment.user?.image,
                            isSystemUser: !!comment.user?.image
                        }}
                        showIcon={false}
                    />
                    {isEdited && <span className="text-xs italic text-foreground/60">(edited)</span>}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/60">
                        {formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}
                    </span>
                    {canEdit && !isEditing && (
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                disabled={isSubmitting}
                                className="h-6 w-6 p-0"
                            >
                                <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={isSubmitting}
                                className="h-6 w-6 p-0"
                            >
                                <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

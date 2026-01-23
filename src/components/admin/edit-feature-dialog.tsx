'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/editor/rich-text-editor'

interface EditFeatureDialogProps {
    featureId: string
    currentTitle: string
    currentDescription: string
    hasExternalWorkItem: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EditFeatureDialog({ 
    featureId, 
    currentTitle,
    currentDescription,
    hasExternalWorkItem,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: EditFeatureDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange || setInternalOpen
    const [title, setTitle] = useState(currentTitle)
    const [description, setDescription] = useState(currentDescription)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required')
            return
        }

        if (title === currentTitle && description === currentDescription) {
            setError('No changes detected')
            return
        }

        setError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/features/${featureId}/edit`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update feature')
            }

            // Close dialog and refresh
            setOpen(false)
            setTitle(currentTitle)
            setDescription(currentDescription)
            
            startTransition(() => {
                router.refresh()
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update feature')
            console.error('Feature update error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Feature Request</DialogTitle>
                        <DialogDescription>
                            Update the title and description of this feature request.
                            {hasExternalWorkItem && (
                                <span className="block mt-2 text-brand-orange">
                                    ⚠️ This will also update the linked work item in GitHub/Azure DevOps.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting || isPending}
                                placeholder="Enter feature title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <RichTextEditor
                                content={description}
                                onChange={setDescription}
                                placeholder="Describe the feature request in detail..."
                                editable={!isSubmitting && !isPending}
                                className="min-h-[200px]"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting || isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isPending}
                        >
                            {isSubmitting || isPending ? (
                                'Updating...'
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

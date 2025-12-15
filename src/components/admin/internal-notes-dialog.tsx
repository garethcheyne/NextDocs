'use client'

import { useState, useTransition } from 'react'
import { formatDate } from '@/lib/utils/date-format'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Eye } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface InternalNote {
    id: string
    content: string
    createdAt: string
    creator: {
        id: string
        name: string | null
        email: string
    }
}

interface InternalNotesDialogProps {
    featureId: string
    existingNotes: InternalNote[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function InternalNotesDialog({
    featureId,
    existingNotes,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: InternalNotesDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange || setInternalOpen
    
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!content.trim()) {
            setError('Note content cannot be empty')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`/api/features/${featureId}/admin/internal-notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content.trim() }),
            })

            if (response.ok) {
                startTransition(() => {
                    setContent('')
                    setShowAddForm(false)
                    router.refresh()
                })
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to add note')
            }
        } catch (err) {
            setError('Failed to add note')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Internal Notes
                    </DialogTitle>
                    <DialogDescription>
                        Private admin notes for this feature request. Only visible to administrators.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Add Note Form */}
                    {showAddForm ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Note</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="content">Note Content</Label>
                                        <Textarea
                                            id="content"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Enter your internal note..."
                                            rows={4}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    {error && (
                                        <p className="text-sm text-destructive">{error}</p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button 
                                            type="submit" 
                                            disabled={isSubmitting || !content.trim()}
                                        >
                                            {isSubmitting ? 'Adding...' : 'Add Note'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => {
                                                setShowAddForm(false)
                                                setContent('')
                                                setError(null)
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button onClick={() => setShowAddForm(true)} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Internal Note
                        </Button>
                    )}

                    {/* Existing Notes */}
                    {existingNotes.length > 0 ? (
                        <div className="space-y-4">
                            <Separator />
                            <h3 className="text-lg font-medium">Existing Notes ({existingNotes.length})</h3>
                            
                            {existingNotes.map((note) => (
                                <Card key={note.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{note.creator.name || note.creator.email}</span>
                                                <span>•</span>
                                                <span>{formatDate(note.createdAt)}</span>
                                                <span>{new Date(note.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="whitespace-pre-wrap text-sm">
                                            {note.content}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No internal notes yet.</p>
                            <p className="text-sm">Add the first note using the button above.</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
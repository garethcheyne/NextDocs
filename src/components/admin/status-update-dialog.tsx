'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { WorkItemCreationDialog } from './work-item-creation-dialog'

interface StatusUpdateDialogProps {
    featureId: string
    currentStatus: string
    featureTitle: string
    featureDescription: string
    integrationType: 'github' | 'azure-devops' | null

    hasExistingWorkItem: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const statusOptions = [
    { value: 'proposal', label: 'Proposal', description: 'Submitted for review' },
    { value: 'approved', label: 'Approved', description: 'Accepted for development' },
    { value: 'in-progress', label: 'In Progress', description: 'Currently being developed' },
    { value: 'completed', label: 'Completed', description: 'Implementation finished' },
    { value: 'declined', label: 'Declined', description: 'Not pursuing this feature' },
    { value: 'on-hold', label: 'On Hold', description: 'Paused temporarily' },
]

export function StatusUpdateDialog({ 
    featureId, 
    currentStatus,
    featureTitle,
    featureDescription,
    integrationType,
    hasExistingWorkItem,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: StatusUpdateDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange || setInternalOpen
    const [status, setStatus] = useState(currentStatus)
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Work item creation dialog state
    const [showWorkItemDialog, setShowWorkItemDialog] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (status === currentStatus) {
            setError('Please select a different status')
            return
        }

        setError(null)

        // Note: Auto-creation removed - admins must manually create work items via "Create Work Item" button
        // This ensures human review and customization for each work item

        // Proceed with status update
        await updateStatus()
    }

    const updateStatus = async (workItemData?: { title: string; description: string; workItemType: string; tags: string[] }) => {
        setIsSubmitting(true)

        try {
            // First, update the status
            const statusResponse = await fetch(`/api/admin/features/${featureId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reason: reason.trim() || undefined }),
            })

            if (!statusResponse.ok) {
                const data = await statusResponse.json()
                throw new Error(data.error || 'Failed to update status')
            }

            // If work item data provided, create the work item
            if (workItemData) {
                const workItemResponse = await fetch(`/api/admin/features/${featureId}/create-work-item`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workItemData),
                })

                if (!workItemResponse.ok) {
                    const data = await workItemResponse.json()
                    console.error('Failed to create work item:', data.error)
                    // Don't fail the whole operation if work item creation fails
                }
            }

            // Close dialogs and refresh
            setOpen(false)
            setShowWorkItemDialog(false)
            setStatus(currentStatus)
            setReason('')
            
            startTransition(() => {
                router.refresh()
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status')
            console.error('Status update error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Update Feature Status</DialogTitle>
                            <DialogDescription>
                                Change the status of this feature request. All followers will be notified.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">New Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                disabled={option.value === currentStatus}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{option.label}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Current status: <span className="font-medium capitalize">{currentStatus.replace('_', ' ')}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (optional)</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Explain why you're changing the status..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    disabled={isSubmitting || isPending}
                                    rows={3}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {reason.length} / 1000
                                </p>
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
                                disabled={status === currentStatus || isSubmitting || isPending || reason.length > 1000}
                            >
                                {isSubmitting || isPending ? (
                                    'Updating...'
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Update Status
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Work Item Creation Dialog */}
            <WorkItemCreationDialog
                open={showWorkItemDialog}
                onOpenChange={setShowWorkItemDialog}
                featureRequest={{
                    id: featureId,
                    title: featureTitle,
                    description: featureDescription,
                }}
                integrationType={integrationType}
                onConfirm={(data) => {
                    updateStatus(data)
                }}
            />
        </>
    )
}

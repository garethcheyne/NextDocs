'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedFeatureActionsDialogProps {
  featureId: string
  isPinned: boolean
  isArchived: boolean
  commentsLocked: boolean
  priority?: string
}

export function AdvancedFeatureActionsDialog({
  featureId,
  isPinned,
  isArchived,
  commentsLocked,
  priority = 'medium',
}: AdvancedFeatureActionsDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [internalNote, setInternalNote] = useState('')
  const [showInternalNoteForm, setShowInternalNoteForm] = useState(false)

  const handleTogglePin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/features/${featureId}/admin/toggle-pin`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleArchive = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/features/${featureId}/admin/toggle-archive`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling archive:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleLockComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/features/${featureId}/admin/toggle-lock-comments`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling lock comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPriority = async (newPriority: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/features/${featureId}/admin/set-priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error setting priority:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/features/${featureId}/admin/internal-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: internalNote }),
      })
      if (response.ok) {
        setInternalNote('')
        setShowInternalNoteForm(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error adding internal note:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/features/${featureId}/export`)
      const data = await response.json()
      
      // Download as JSON
      const element = document.createElement('a')
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)))
      element.setAttribute('download', `feature-${featureId}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (error) {
      console.error('Error exporting feature:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" disabled={isLoading}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Actions</DialogTitle>
          <DialogDescription>Manage feature metadata and administration</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority Level */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select defaultValue={priority} onValueChange={handleSetPriority} disabled={isLoading}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pin Feature */}
          <Button
            variant={isPinned ? 'secondary' : 'outline'}
            className="w-full justify-start"
            onClick={handleTogglePin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isPinned ? '📌 Unpin Feature' : '📌 Pin Feature'}
            {isPinned && <Badge variant="secondary" className="ml-auto">Active</Badge>}
          </Button>

          {/* Lock Comments */}
          <Button
            variant={commentsLocked ? 'secondary' : 'outline'}
            className="w-full justify-start"
            onClick={handleToggleLockComments}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {commentsLocked ? '🔒 Unlock Comments' : '🔓 Lock Comments'}
            {commentsLocked && <Badge variant="secondary" className="ml-auto">Locked</Badge>}
          </Button>

          {/* Archive Feature */}
          <Button
            variant={isArchived ? 'secondary' : 'outline'}
            className="w-full justify-start"
            onClick={handleToggleArchive}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isArchived ? '📂 Unarchive' : '📦 Archive Feature'}
            {isArchived && <Badge variant="secondary" className="ml-auto">Archived</Badge>}
          </Button>

          {/* Internal Notes */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Internal Notes</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInternalNoteForm(!showInternalNoteForm)}
              >
                {showInternalNoteForm ? '✕' : '+ Add'}
              </Button>
            </div>

            {showInternalNoteForm && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a private note (visible to admins only)..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  disabled={isLoading}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleAddInternalNote}
                  disabled={!internalNote.trim() || isLoading}
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Note
                </Button>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              📥 Export as JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, GitBranch, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Feature {
  id: string
  title: string
  description: string
  externalId: string | null
  status: string
  category: {
    id: string
    name: string
    integrationType: string | null
  } | null
}

interface MergeDialogProps {
  sourceFeature: Feature
  availableFeatures: Feature[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MergeDialog({ sourceFeature, availableFeatures, open, onOpenChange }: MergeDialogProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [targetFeatureId, setTargetFeatureId] = useState<string>('')
  const [mergedDescription, setMergedDescription] = useState('')
  const [parentFeatureId, setParentFeatureId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const targetFeature = availableFeatures.find(f => f.id === targetFeatureId)

  // Determine merge rules
  const getMergeValidation = () => {
    if (!targetFeature) return { valid: false, reason: 'Please select a feature to merge with' }

    const sourceHasExternal = !!sourceFeature.externalId
    const targetHasExternal = !!targetFeature.externalId

    if (sourceHasExternal && targetHasExternal) {
      return { 
        valid: false, 
        reason: 'Cannot merge two features that are both linked to external systems (DevOps/Git)' 
      }
    }

    return { valid: true, reason: '' }
  }

  const validation = getMergeValidation()

  // Auto-determine parent when target changes
  useEffect(() => {
    if (!targetFeature) return

    const sourceHasExternal = !!sourceFeature.externalId
    const targetHasExternal = !!targetFeature.externalId

    if (sourceHasExternal && !targetHasExternal) {
      setParentFeatureId(sourceFeature.id)
    } else if (!sourceHasExternal && targetHasExternal) {
      setParentFeatureId(targetFeature.id)
    } else {
      // Neither has external link, let admin choose
      setParentFeatureId('')
    }

    // Combine descriptions
    const combinedDesc = `${sourceFeature.description}\n\n---\n\n${targetFeature.description}`
    setMergedDescription(combinedDesc)
  }, [targetFeature, sourceFeature])

  const handleMerge = async () => {
    if (!targetFeature || !validation.valid) return

    // Determine parent and child
    const sourceHasExternal = !!sourceFeature.externalId
    const targetHasExternal = !!targetFeature.externalId
    
    let parentId = parentFeatureId
    if (sourceHasExternal && !targetHasExternal) {
      parentId = sourceFeature.id
    } else if (!sourceHasExternal && targetHasExternal) {
      parentId = targetFeature.id
    }

    if (!parentId) {
      setError('Please select which feature should be the parent')
      return
    }

    const childId = parentId === sourceFeature.id ? targetFeature.id : sourceFeature.id

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/features/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId,
          childId,
          mergedDescription: mergedDescription.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to merge features')
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error merging features:', error)
      setError(error instanceof Error ? error.message : 'Failed to merge features')
    } finally {
      setIsLoading(false)
    }
  }

  // Only show to admins
  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    return null
  }

  // Filter out features that can't be merged
  const validTargets = availableFeatures.filter(f => 
    f.id !== sourceFeature.id && 
    f.status !== 'merged' &&
    f.status !== 'declined'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Merge Feature Request
          </DialogTitle>
          <DialogDescription>
            Merge &quot;{sourceFeature.title}&quot; with another feature request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target Feature Selection */}
          <div className="space-y-2">
            <Label>Merge with feature:</Label>
            <Select value={targetFeatureId} onValueChange={setTargetFeatureId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a feature to merge with" />
              </SelectTrigger>
              <SelectContent>
                {validTargets.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    <div className="flex items-center gap-2">
                      <span>{feature.title}</span>
                      {feature.externalId && (
                        <Badge variant="outline" className="text-xs">
                          {feature.category?.integrationType || 'External'}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Validation Error */}
          {targetFeature && !validation.valid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validation.reason}</AlertDescription>
            </Alert>
          )}

          {/* Parent Selection (when neither has external link) */}
          {targetFeature && validation.valid && !sourceFeature.externalId && !targetFeature.externalId && (
            <div className="space-y-2">
              <Label>Which feature should be the parent?</Label>
              <Select value={parentFeatureId} onValueChange={setParentFeatureId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={sourceFeature.id}>
                    {sourceFeature.title} (current)
                  </SelectItem>
                  <SelectItem value={targetFeature.id}>
                    {targetFeature.title}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Auto-determined parent info */}
          {targetFeature && validation.valid && (sourceFeature.externalId || targetFeature.externalId) && (
            <Alert>
              <AlertDescription>
                {sourceFeature.externalId ? (
                  <>Parent will be &quot;{sourceFeature.title}&quot; (has external link)</>
                ) : (
                  <>Parent will be &quot;{targetFeature.title}&quot; (has external link)</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Description Editor */}
          {targetFeature && validation.valid && (
            <div className="space-y-2">
              <Label>Merged Description:</Label>
              <Textarea
                value={mergedDescription}
                onChange={(e) => setMergedDescription(e.target.value)}
                rows={8}
                placeholder="Edit the combined description..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                You can edit this to combine the descriptions from both features
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!targetFeature || !validation.valid || isLoading || (!parentFeatureId && !sourceFeature.externalId && !targetFeature?.externalId)}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Merge Features
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
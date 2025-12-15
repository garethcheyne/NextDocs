'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LogOut, AlertTriangle, Shield } from 'lucide-react'
import { toast } from 'sonner'

export function ClearSessionsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const requiredText = 'CLEAR ALL SESSIONS'

  const handleClearSessions = async () => {
    if (confirmText !== requiredText) {
      toast.error('Please type the exact confirmation text')
      return
    }

    console.log('🔄 Starting clear sessions request...')
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/clear-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📦 Response data:', data)

      if (response.ok) {
        console.log('✅ Success - showing toast')
        toast.success(data.message || 'All sessions cleared successfully')
        setIsOpen(false)
        setConfirmText('')
      } else {
        console.log('❌ Error response - showing error toast')
        toast.error(data.error || 'Failed to clear sessions')
      }
    } catch (error) {
      console.log('💥 Exception caught:', error)
      toast.error('Failed to clear sessions')
      console.error('Error clearing sessions:', error)
    } finally {
      setIsLoading(false)
      console.log('🏁 Request completed')
    }
  }

  const handleDialogClose = () => {
    setIsOpen(false)
    setConfirmText('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          onClick={() => {
            console.log('🔐 [CLIENT] Clear Sessions button clicked (trigger)')
            toast.info('Dialog opened - Toast system is working!')
          }}
        >
          <Shield className="w-4 h-4 mr-2" />
          Clear All Sessions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Clear All User Sessions
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded">
              <p className="font-medium text-red-800 dark:text-red-200">
                🚨 Critical Admin Action
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This will forcibly log out ALL users from the system, including yourself.
              </p>
            </div>
            <div className="text-sm space-y-2">
              <p className="font-medium">This action will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Clear all user sessions from the database</li>
                <li>Force users to re-login when tokens expire</li>
                <li>Log this action for security audit</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm font-medium">
                Type <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-red-600">{requiredText}</code> to confirm:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type confirmation text..."
                className="text-center"
                disabled={isLoading}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleDialogClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              console.log('🔐 [CLIENT] Clear All Sessions button clicked (main action)')
              console.log('🔐 [CLIENT] Button disabled:', isLoading || confirmText !== requiredText)
              console.log('🔐 [CLIENT] isLoading:', isLoading)
              console.log('🔐 [CLIENT] confirmText === requiredText:', confirmText === requiredText)
              handleClearSessions()
            }}
            disabled={isLoading || confirmText !== requiredText}
          >
            {isLoading ? 'Clearing Sessions...' : 'Clear All Sessions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
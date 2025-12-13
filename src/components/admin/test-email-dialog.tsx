'use client'

import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const emailTemplates = [
  { value: 'basic', label: 'Basic Test Email' },
  { value: 'feature-status-change', label: 'Feature Status Change' },
  { value: 'new-comment', label: 'New Comment Notification' },
  { value: 'new-feature', label: 'New Feature Request' },
]

export function TestEmailDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [template, setTemplate] = useState('basic')
  const [isSending, setIsSending] = useState(false)

  const handleSendTest = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, template }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Test email sent successfully')
        setOpen(false)
        setEmail('')
        setTemplate('basic')
      } else {
        toast.error(data.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Failed to send test email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Test Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Email Templates</DialogTitle>
          <DialogDescription>
            Send test emails to verify email configuration and preview templates
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((tmpl) => (
                  <SelectItem key={tmpl.value} value={tmpl.value}>
                    {tmpl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {template === 'basic' && 'Sends a basic test email to verify email configuration.'}
            {template === 'feature-status-change' && 'Preview the email sent when a feature request status changes.'}
            {template === 'new-comment' && 'Preview the email sent when someone comments on a feature request.'}
            {template === 'new-feature' && 'Preview the email sent when a new feature request is submitted.'}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSendTest}
            disabled={isSending || !email}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Calendar,
  Shield,
  Activity,
  Settings,
  AlertTriangle
} from 'lucide-react'
import { getExpiryDateOptions, isAPIKeyExpired } from '@/lib/api-keys/utils'
import { format } from 'date-fns'

interface APIKey {
  id: string
  name: string
  description: string | null
  keyPreview: string
  permissions: string
  expiresAt: string
  lastUsedAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface APIKeyManagementProps {
  userId: string
}

export function APIKeyManagement({ userId }: APIKeyManagementProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKeyValue, setNewKeyValue] = useState('')

  // Form state for creating new API key
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: 'read',
    expiryOption: '30 days',
    customExpiry: ''
  })

  const expiryOptions = getExpiryDateOptions()

  useEffect(() => {
    fetchAPIKeys()
  }, [])

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!formData.name.trim()) {
      toast.error('API key name is required')
      return
    }

    try {
      const expiryDate = formData.expiryOption === 'custom'
        ? formData.customExpiry
        : expiryOptions.find(opt => opt.label === formData.expiryOption)?.value

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          permissions: formData.permissions,
          expiresAt: expiryDate
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewKeyValue(data.key) // The raw key for one-time display
        setShowNewKey(true)
        setShowCreateDialog(false)
        setFormData({
          name: '',
          description: '',
          permissions: 'read',
          expiryOption: '30 days',
          customExpiry: ''
        })
        fetchAPIKeys() // Refresh the list
        toast.success('API key created successfully')
      } else {
        toast.error('Failed to create API key')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    }
  }

  const handleToggleActive = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive
        }),
      })

      if (response.ok) {
        fetchAPIKeys()
        toast.success(`API key ${!isActive ? 'activated' : 'deactivated'}`)
      } else {
        toast.error('Failed to update API key')
      }
    } catch (error) {
      console.error('Error updating API key:', error)
      toast.error('Failed to update API key')
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAPIKeys()
        toast.success('API key deleted')
      } else {
        toast.error('Failed to delete API key')
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getStatusBadge = (key: APIKey) => {
    const expired = isAPIKeyExpired(new Date(key.expiresAt))

    if (expired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (!key.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getPermissionsBadge = (permissions: string) => {
    return (
      <Badge variant={permissions === 'write' ? 'destructive' : 'default'}>
        {permissions === 'write' ? 'Read/Write' : 'Read Only'}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading API keys...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create API Key Button */}
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access. Make sure to copy it as it won't be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="My API Key"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What this API key will be used for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <Select
                  value={formData.permissions}
                  onValueChange={(value) => setFormData({ ...formData, permissions: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Read/Write</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expires In</Label>
                <Select
                  value={formData.expiryOption}
                  onValueChange={(value) => setFormData({ ...formData, expiryOption: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiryOptions.map((option) => (
                      <SelectItem key={option.label} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.expiryOption === 'Custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customExpiry">Custom Expiry Date</Label>
                  <Input
                    id="customExpiry"
                    type="date"
                    value={formData.customExpiry}
                    onChange={(e) => setFormData({ ...formData, customExpiry: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey}>
                Create API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show new key dialog */}
      <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Your API key has been generated. Copy it now as it won't be displayed again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <code className="font-mono text-sm break-all">{newKeyValue}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newKeyValue)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowNewKey(false)}>
              I've copied the key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card className='bg-gray-900/40 border-gray-800/50 backdrop-blur-xl'>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any API keys yet. Create your first API key to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id} className='bg-gray-900/40 border-gray-800/50 backdrop-blur-xl'>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{key.name}</CardTitle>
                    {key.description && (
                      <CardDescription>{key.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(key)}
                    {getPermissionsBadge(key.permissions)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Key className="h-4 w-4" />
                        Key Preview
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono">{key.keyPreview}</code>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Expires
                      </div>
                      <p>{format(new Date(key.expiresAt), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Activity className="h-4 w-4" />
                        Last Used
                      </div>
                      <p>
                        {key.lastUsedAt
                          ? format(new Date(key.lastUsedAt), 'MMM d, yyyy')
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${key.id}`}>Active</Label>
                        <Switch
                          id={`active-${key.id}`}
                          checked={key.isActive}
                          onCheckedChange={() => handleToggleActive(key.id, key.isActive)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the API key "{key.name}"?
                              This action cannot be undone and will immediately revoke access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteKey(key.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
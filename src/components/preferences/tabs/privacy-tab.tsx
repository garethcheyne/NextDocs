'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Eye, Database, Download, Trash2, User, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PrivacyTabProps {
  userId: string
}

interface PrivacySettings {
  profileVisibility: 'public' | 'internal' | 'private'
  showEmail: boolean
  showActivity: boolean
  allowMentions: boolean
  dataProcessingConsent: boolean
  analyticsConsent: boolean
  marketingConsent: boolean
}

interface UserData {
  createdAt: string
  totalFeatures: number
  totalComments: number
  totalLikes: number
  lastLogin: string
}

export function PrivacyTab({ userId }: PrivacyTabProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'internal',
    showEmail: false,
    showActivity: true,
    allowMentions: true,
    dataProcessingConsent: true,
    analyticsConsent: true,
    marketingConsent: false
  })
  const [userData, setUserData] = useState<UserData>({
    createdAt: '',
    totalFeatures: 0,
    totalComments: 0,
    totalLikes: 0,
    lastLogin: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsResponse, dataResponse] = await Promise.all([
          fetch('/api/user/privacy-settings'),
          fetch('/api/user/data-summary')
        ])

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setSettings(settingsData)
        }

        if (dataResponse.ok) {
          const data = await dataResponse.json()
          setUserData(data)
        }
      } catch (error) {
        console.error('Error fetching privacy data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Your privacy preferences have been saved.')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save your privacy settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'POST',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('Your data export will download shortly.')
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      toast.error('Failed to export your data.')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Your account deletion request has been submitted. You will receive an email confirmation.')
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      toast.error('Failed to process account deletion. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="radio"
                id="visibility-public"
                name="visibility"
                value="public"
                checked={settings.profileVisibility === 'public'}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'internal' | 'private' }))
                }
                className="w-4 h-4"
              />
              <Label htmlFor="visibility-public" className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Public</span>
                  <Badge variant="outline">Anyone</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your profile is visible to everyone, including external users
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                type="radio"
                id="visibility-internal"
                name="visibility"
                value="internal"
                checked={settings.profileVisibility === 'internal'}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'internal' | 'private' }))
                }
                className="w-4 h-4"
              />
              <Label htmlFor="visibility-internal" className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Internal</span>
                  <Badge variant="secondary">Organization</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Only visible to authenticated users within your organization
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                type="radio"
                id="visibility-private"
                name="visibility"
                value="private"
                checked={settings.profileVisibility === 'private'}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'internal' | 'private' }))
                }
                className="w-4 h-4"
              />
              <Label htmlFor="visibility-private" className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Private</span>
                  <Badge variant="outline">Hidden</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your profile is hidden from other users
                </p>
              </Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-email" className="text-sm font-medium">
                  Show email address
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display your email on your public profile
                </p>
              </div>
              <Switch
                id="show-email"
                checked={settings.showEmail}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, showEmail: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-activity" className="text-sm font-medium">
                  Show activity history
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display your recent activity on your profile
                </p>
              </div>
              <Switch
                id="show-activity"
                checked={settings.showActivity}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, showActivity: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-mentions" className="text-sm font-medium">
                  Allow mentions
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Let other users mention you in comments
                </p>
              </div>
              <Switch
                id="allow-mentions"
                checked={settings.allowMentions}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, allowMentions: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-processing" className="text-sm font-medium">
                  Data processing consent
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow processing of your data for core platform features
                </p>
              </div>
              <Switch
                id="data-processing"
                checked={settings.dataProcessingConsent}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, dataProcessingConsent: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics-consent" className="text-sm font-medium">
                  Analytics consent
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help improve the platform with anonymous usage analytics
                </p>
              </div>
              <Switch
                id="analytics-consent"
                checked={settings.analyticsConsent}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, analyticsConsent: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-consent" className="text-sm font-medium">
                  Marketing communications
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive updates about new features and improvements
                </p>
              </div>
              <Switch
                id="marketing-consent"
                checked={settings.marketingConsent}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, marketingConsent: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data Summary
          </CardTitle>
          <CardDescription>
            Overview of the data we store about you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userData.totalFeatures}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Feature Requests</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userData.totalComments}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userData.totalLikes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Likes Given</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {userData.createdAt ? new Date(userData.createdAt).getFullYear() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Member Since</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account created: {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last login: {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Export your data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download a copy of all your data in JSON format
              </p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <h3 className="font-medium text-red-700 dark:text-red-400">Delete your account</h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile and account information</li>
                      <li>All feature requests you've created</li>
                      <li>All comments you've made</li>
                      <li>Your notification preferences</li>
                      <li>Your activity history</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>
    </div>
  )
}
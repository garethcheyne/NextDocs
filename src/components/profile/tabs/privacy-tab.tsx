'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Database, Download, Info } from 'lucide-react'

interface PrivacyTabProps {
  userId: string
}

export function PrivacyTab({ userId }: PrivacyTabProps) {
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
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Privacy Information */}
      <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Information about how your data is handled in this enterprise system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Enterprise Data Management
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                Your account information is managed through Active Directory. Data is stored securely 
                within the organization's infrastructure and is subject to company data governance policies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of your activity and contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Export includes your profile information, feature requests, comments, and activity history.
              </p>
              <p className="text-xs text-muted-foreground">
                Data will be provided in JSON format for your records.
              </p>
            </div>
            <Button onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Details about data handling and organizational policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Authentication</span>
              <span>Active Directory (SSO)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Data Location</span>
              <span>Enterprise Infrastructure</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Data Retention</span>
              <span>Per Company Policy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profile Visibility</span>
              <span>Internal Organization Only</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
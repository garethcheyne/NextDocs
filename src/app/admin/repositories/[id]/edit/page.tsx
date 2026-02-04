'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast, Toaster } from 'sonner'

export default function EditRepositoryPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [repository, setRepository] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    basePath: '',
    syncSchedule: 'HOURLY_6',
    enabled: true,
    pat: '',
    // GitHub fields
    owner: '',
    repo: '',
    // Azure fields
    organization: '',
    project: '',
    repositoryId: '',
  })

  useEffect(() => {
    fetchRepository()
  }, [params.id])

  const fetchRepository = async () => {
    try {
      const response = await fetch(`/api/repositories/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch repository')

      const data = await response.json()
      setRepository(data.repository)

      // Map sync frequency to schedule
      const frequencyMap: Record<number, string> = {
        3600: 'HOURLY_1',
        21600: 'HOURLY_6',
        43200: 'HOURLY_12',
        86400: 'DAILY',
        0: 'MANUAL',
      }

      setFormData({
        name: data.repository.name,
        branch: data.repository.branch,
        basePath: data.repository.basePath,
        syncSchedule: frequencyMap[data.repository.syncFrequency] || 'HOURLY_6',
        enabled: data.repository.enabled,
        pat: '', // Don't populate PAT for security
        // GitHub fields
        owner: data.repository.owner || '',
        repo: data.repository.repo || '',
        // Azure fields
        organization: data.repository.organization || '',
        project: data.repository.project || '',
        repositoryId: data.repository.repositoryId || '',
      })

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch repository:', error)
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      // If PAT was updated, use the new one for testing
      let testPayload: any = {}
      
      if (formData.pat) {
        testPayload.pat = formData.pat
      }

      // Include location fields in case they were updated
      if (repository.source === 'github') {
        testPayload.owner = formData.owner
        testPayload.repo = formData.repo
      } else if (repository.source === 'azure') {
        testPayload.organization = formData.organization
        testPayload.project = formData.project
        testPayload.repositoryId = formData.repositoryId
      }

      const response = await fetch(`/api/repositories/${params.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      })

      const data = await response.json()
      setTestResult(data)

      if (data.success) {
        toast.success('Connection test successful')
      } else {
        toast.error(data.error || 'Connection test failed')
      }
    } catch (error: any) {
      console.error('Connection test failed:', error)
      setTestResult({ success: false, message: error.message || 'Connection test failed' })
      toast.error('Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const syncFrequencyMap: Record<string, number> = {
        HOURLY_1: 3600,
        HOURLY_6: 21600,
        HOURLY_12: 43200,
        DAILY: 86400,
        MANUAL: 0,
      }

      const updateData: any = {
        name: formData.name,
        branch: formData.branch,
        basePath: formData.basePath,
        syncFrequency: syncFrequencyMap[formData.syncSchedule],
        enabled: formData.enabled,
      }

      // Include PAT if it was updated
      if (formData.pat) {
        updateData.pat = formData.pat
      }

      // Include location fields based on source type
      if (repository.source === 'github') {
        updateData.owner = formData.owner
        updateData.repo = formData.repo
      } else if (repository.source === 'azure') {
        updateData.organization = formData.organization
        updateData.project = formData.project
        updateData.repositoryId = formData.repositoryId
      }

      const response = await fetch(`/api/repositories/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update repository')
      }

      toast.success('Repository updated successfully')
      setTimeout(() => {
        router.push(`/admin/repositories/${params.id}`)
      }, 1000)
    } catch (error: any) {
      console.error('Failed to update repository:', error)
      toast.error(error.message || 'Failed to update repository')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNavigation
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Repositories', href: '/admin/repositories' },
              { label: 'Loading...', href: '#' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading repository...
          </div>
        </div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="flex flex-col h-full">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNavigation
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Repositories', href: '/admin/repositories' },
              { label: 'Not Found', href: '#' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">Repository not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Repositories', href: '/admin/repositories' },
            { label: repository.name, href: `/admin/repositories/${params.id}` },
            { label: 'Edit', href: `/admin/repositories/${params.id}/edit` },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              Edit Repository
            </h1>
            <p className="text-muted-foreground mt-2">
              Update repository settings and configuration
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  General repository identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Repository Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="My Documentation Repository"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Source Location */}
            <Card>
              <CardHeader>
                <CardTitle>Repository Location</CardTitle>
                <CardDescription>
                  Source repository configuration for {repository.source === 'github' ? 'GitHub' : 'Azure DevOps'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {repository.source === 'github' ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="owner">Owner/Organization *</Label>
                        <Input
                          id="owner"
                          type="text"
                          value={formData.owner}
                          onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                          required
                          placeholder="octocat"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="repo">Repository *</Label>
                        <Input
                          id="repo"
                          type="text"
                          value={formData.repo}
                          onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                          required
                          placeholder="my-repo"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Example: github.com/{formData.owner || 'owner'}/{formData.repo || 'repository'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization *</Label>
                        <Input
                          id="organization"
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          required
                          placeholder="myorg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Input
                          id="project"
                          type="text"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                          required
                          placeholder="MyProject"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="repositoryId">Repository ID *</Label>
                        <Input
                          id="repositoryId"
                          type="text"
                          value={formData.repositoryId}
                          onChange={(e) => setFormData({ ...formData, repositoryId: e.target.value })}
                          required
                          placeholder="my-repo"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Example: dev.azure.com/{formData.organization || 'org'}/{formData.project || 'project'}/_git/{formData.repositoryId || 'repo'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Update personal access token for repository access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pat">
                    Personal Access Token (PAT)
                  </Label>
                  <Input
                    id="pat"
                    type="password"
                    value={formData.pat}
                    onChange={(e) => {
                      setFormData({ ...formData, pat: e.target.value })
                      setTestResult(null) // Clear test result when PAT changes
                    }}
                    placeholder="Leave empty to keep existing token"
                  />
                  <p className="text-xs text-muted-foreground">
                    {repository.source === 'github' 
                      ? 'GitHub Personal Access Token with repo permissions'
                      : 'Azure DevOps Personal Access Token with Code (Read) permissions'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  {testResult && (
                    <Alert className={testResult.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}>
                      <div className="flex items-center gap-2">
                        {testResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <AlertDescription className={testResult.success ? 'text-green-500' : 'text-red-500'}>
                          {testResult.message || testResult.error || (testResult.success ? 'Connection successful' : 'Connection failed')}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Repository Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Repository Settings</CardTitle>
                <CardDescription>
                  Branch, path, and synchronization configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">
                      Branch *
                    </Label>
                    <Input
                      id="branch"
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      required
                      placeholder="main"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePath">
                      Base Path
                    </Label>
                    <Input
                      id="basePath"
                      type="text"
                      value={formData.basePath}
                      onChange={(e) => setFormData({ ...formData, basePath: e.target.value })}
                      placeholder="/"
                    />
                    <p className="text-xs text-muted-foreground">
                      Path within repository (e.g., /docs)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncSchedule">
                    Sync Schedule
                  </Label>
                  <Select
                    value={formData.syncSchedule}
                    onValueChange={(value) => setFormData({ ...formData, syncSchedule: value })}
                  >
                    <SelectTrigger id="syncSchedule">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY_1">Every hour</SelectItem>
                      <SelectItem value="HOURLY_6">Every 6 hours</SelectItem>
                      <SelectItem value="HOURLY_12">Every 12 hours</SelectItem>
                      <SelectItem value="DAILY">Daily at 2am</SelectItem>
                      <SelectItem value="MANUAL">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked as boolean })}
                  />
                  <Label htmlFor="enabled" className="cursor-pointer font-normal">
                    Enable automatic synchronization
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/admin/repositories/${params.id}`)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

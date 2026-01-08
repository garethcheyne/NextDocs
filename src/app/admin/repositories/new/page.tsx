'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

type SyncStep = {
  id: string
  label: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message?: string
}

export default function NewRepositoryPage() {
  const router = useRouter()
  const [provider, setProvider] = useState<'AZURE_DEVOPS' | 'GITHUB'>('AZURE_DEVOPS')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncSteps, setSyncSteps] = useState<SyncStep[]>([
    { id: 'save', label: 'Saving repository configuration', status: 'pending' },
    { id: 'connect', label: 'Testing connection', status: 'pending' },
    { id: 'scan', label: 'Scanning for documentation files', status: 'pending' },
    { id: 'index', label: 'Indexing content', status: 'pending' },
    { id: 'complete', label: 'Finalizing setup', status: 'pending' },
  ])

  const [formData, setFormData] = useState({
    name: '',
    repoUrl: '',
    // Azure DevOps
    azureOrganization: '',
    azureProject: '',
    azureRepository: '',
    azurePat: '',
    // GitHub
    githubOwner: '',
    githubRepo: '',
    githubToken: '',
    // Common
    branch: 'main',
    basePath: '/',
    syncSchedule: 'HOURLY_6',
    enabled: true,
  })

  const parseRepositoryUrl = (url: string) => {
    try {
      // Azure DevOps: https://dev.azure.com/{org}/{project}/_git/{repo}
      const azureMatch = url.match(/dev\.azure\.com\/([^/]+)\/([^/]+)\/_git\/([^/?#]+)/)
      if (azureMatch) {
        const [, org, project, repo] = azureMatch
        setProvider('AZURE_DEVOPS')
        setFormData(prev => ({
          ...prev,
          azureOrganization: decodeURIComponent(org),
          azureProject: decodeURIComponent(project),
          azureRepository: decodeURIComponent(repo),
          name: prev.name || decodeURIComponent(repo),
        }))
        return
      }

      // GitHub: https://github.com/{owner}/{repo}
      const githubMatch = url.match(/github\.com\/([^/]+)\/([^/?#]+)/)
      if (githubMatch) {
        const [, owner, repo] = githubMatch
        setProvider('GITHUB')
        setFormData(prev => ({
          ...prev,
          githubOwner: owner,
          githubRepo: repo.replace(/\.git$/, ''),
          name: prev.name || repo.replace(/\.git$/, ''),
        }))
        return
      }
    } catch (error) {
      console.error('Failed to parse repository URL:', error)
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, repoUrl: url })
    if (url.trim()) {
      parseRepositoryUrl(url)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    // Simulate API call
    setTimeout(() => {
      setTestResult({
        success: true,
        message: 'Connection successful! Found 23 markdown files.',
      })
      setIsLoading(false)
    }, 2000)
  }

  const updateSyncStep = (stepId: string, status: SyncStep['status'], message?: string) => {
    setSyncSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, status, message } : step
      )
    )
  }

  const simulateSync = async () => {
    const steps = ['save', 'connect', 'scan', 'index', 'complete']
    
    for (const stepId of steps) {
      updateSyncStep(stepId, 'processing')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (stepId === 'scan') {
        updateSyncStep(stepId, 'completed', 'Found 23 markdown files')
      } else if (stepId === 'index') {
        updateSyncStep(stepId, 'completed', 'Indexed 23 documents')
      } else {
        updateSyncStep(stepId, 'completed')
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/admin/repositories')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowSyncModal(true)

    try {
      const payload = {
        name: formData.name,
        provider,
        ...(provider === 'AZURE_DEVOPS' && {
          azureOrganization: formData.azureOrganization,
          azureProject: formData.azureProject,
          azureRepository: formData.azureRepository,
          azurePat: formData.azurePat,
        }),
        ...(provider === 'GITHUB' && {
          githubOwner: formData.githubOwner,
          githubRepo: formData.githubRepo,
          githubToken: formData.githubToken,
        }),
        branch: formData.branch,
        basePath: formData.basePath,
        syncSchedule: formData.syncSchedule,
      }

      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create repository')
      }

      // Start sync simulation
      await simulateSync()
    } catch (error) {
      console.error('Failed to create repository:', error)
      setSyncSteps(prev =>
        prev.map(step =>
          step.status === 'processing' ? { ...step, status: 'error', message: 'Failed to save repository' } : step
        )
      )
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNavigation
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Repositories', href: '/admin/repositories' },
              { label: 'New Repository', href: '/admin/repositories/new' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
              Add New Repository
            </h1>
            <p className="text-gray-400 mt-2">
              Connect a documentation repository from Azure DevOps or GitHub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Source Provider</CardTitle>
                <CardDescription>
                  Choose where your documentation is hosted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setProvider('AZURE_DEVOPS')}
                    className={`p-6 rounded-lg border-2 transition-colors ${
                      provider === 'AZURE_DEVOPS'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">☁️</div>
                      <div className="font-semibold">Azure DevOps</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Microsoft Azure DevOps repositories
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('GITHUB')}
                    className={`p-6 rounded-lg border-2 transition-colors ${
                      provider === 'GITHUB'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🐙</div>
                      <div className="font-semibold">GitHub</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        GitHub repositories
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Repository URL */}
            <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Repository URL</CardTitle>
                <CardDescription className="text-gray-400">
                  Paste your repository URL and we'll extract the details automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl" className="text-gray-300">
                    Repository URL
                  </Label>
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="e.g., https://dev.azure.com/harveynorman/HN%20Commercial%20Division/_git/Full%20Documentation%20Repo"
                    value={formData.repoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                  />
                  <p className="text-xs text-gray-500">
                    Supports Azure DevOps and GitHub URLs
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Source Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Repository Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Business Central Documentation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                  />
                  <p className="text-xs text-gray-500">
                    A friendly name to identify this repository
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Azure DevOps Configuration */}
            {provider === 'AZURE_DEVOPS' && (
              <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Azure DevOps Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="azureOrganization" className="text-gray-300">
                      Organization *
                    </Label>
                    <Input
                      id="azureOrganization"
                      type="text"
                      placeholder="e.g., HNC-Apps"
                      value={formData.azureOrganization}
                      onChange={(e) =>
                        setFormData({ ...formData, azureOrganization: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="azureProject" className="text-gray-300">
                      Project *
                    </Label>
                    <Input
                      id="azureProject"
                      type="text"
                      placeholder="e.g., BC-Docs"
                      value={formData.azureProject}
                      onChange={(e) =>
                        setFormData({ ...formData, azureProject: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="azureRepository" className="text-gray-300">
                      Repository *
                    </Label>
                    <Input
                      id="azureRepository"
                      type="text"
                      placeholder="e.g., main"
                      value={formData.azureRepository}
                      onChange={(e) =>
                        setFormData({ ...formData, azureRepository: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="azurePat" className="text-gray-300">
                      Personal Access Token (PAT) *
                    </Label>
                    <Input
                      id="azurePat"
                      type="password"
                      placeholder="Enter your Azure DevOps PAT"
                      value={formData.azurePat}
                      onChange={(e) =>
                        setFormData({ ...formData, azurePat: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                    <p className="text-xs text-gray-500">
                      Requires 'Code (Read)' permission
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* GitHub Configuration */}
            {provider === 'GITHUB' && (
              <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">GitHub Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="githubOwner" className="text-gray-300">
                      Owner / Organization *
                    </Label>
                    <Input
                      id="githubOwner"
                      type="text"
                      placeholder="e.g., garethcheyne"
                      value={formData.githubOwner}
                      onChange={(e) =>
                        setFormData({ ...formData, githubOwner: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubRepo" className="text-gray-300">
                      Repository *
                    </Label>
                    <Input
                      id="githubRepo"
                      type="text"
                      placeholder="e.g., api-docs"
                      value={formData.githubRepo}
                      onChange={(e) =>
                        setFormData({ ...formData, githubRepo: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubToken" className="text-gray-300">
                      Personal Access Token *
                    </Label>
                    <Input
                      id="githubToken"
                      type="password"
                      placeholder="Enter your GitHub token"
                      value={formData.githubToken}
                      onChange={(e) =>
                        setFormData({ ...formData, githubToken: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                    <p className="text-xs text-gray-500">
                      Requires 'repo' scope for private repositories
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Repository Settings */}
            <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Repository Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-gray-300">
                      Branch *
                    </Label>
                    <Input
                      id="branch"
                      type="text"
                      placeholder="main"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePath" className="text-gray-300">
                      Base Path
                    </Label>
                    <Input
                      id="basePath"
                      type="text"
                      placeholder="/"
                      value={formData.basePath}
                      onChange={(e) => setFormData({ ...formData, basePath: e.target.value })}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                    <p className="text-xs text-gray-500">
                      Path to docs folder (e.g., /docs or /)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncSchedule" className="text-gray-300">
                    Sync Schedule
                  </Label>
                  <select
                    id="syncSchedule"
                    title="Sync Schedule"
                    value={formData.syncSchedule}
                    onChange={(e) =>
                      setFormData({ ...formData, syncSchedule: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-brand-orange focus:outline-none"
                  >
                    <option value="HOURLY_1">Every hour</option>
                    <option value="HOURLY_6">Every 6 hours</option>
                    <option value="HOURLY_12">Every 12 hours</option>
                    <option value="DAILY">Daily at 2am</option>
                    <option value="MANUAL">Manual only</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Test Connection Result */}
            {testResult && (
              <Card
                className={`border-2 backdrop-blur-xl ${
                  testResult.success
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                <CardContent className="pt-6">
                  <p
                    className={`${
                      testResult.success ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {testResult.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={isLoading}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isLoading ? 'Testing...' : 'Test Connection'}
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Repository'}
              </Button>

              <Link href="/admin/repositories">
                <Button type="button" variant="ghost" className="text-gray-400 hover:text-white">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Sync Progress Modal */}
        {showSyncModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white/90 dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Setting Up Repository
              </CardTitle>
              <CardDescription className="text-gray-400">
                Please wait while we configure and sync your repository
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {syncSteps.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {step.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {step.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        step.status === 'completed'
                          ? 'text-green-400'
                          : step.status === 'processing'
                          ? 'text-brand-orange'
                          : step.status === 'error'
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.message && (
                      <p className="text-xs text-gray-500 mt-1">{step.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
      </div>
      )}
    </>
  )
}

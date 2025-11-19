'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
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
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { ThemeToggle } from '@/components/theme-toggle'

export default function EditRepositoryPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [repository, setRepository] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    basePath: '',
    syncSchedule: 'HOURLY_6',
    enabled: true,
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
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch repository:', error)
      setIsLoading(false)
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

      const response = await fetch(`/api/repositories/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          branch: formData.branch,
          basePath: formData.basePath,
          syncFrequency: syncFrequencyMap[formData.syncSchedule],
          enabled: formData.enabled,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update repository')
      }

      router.push(`/admin/repositories/${params.id}`)
    } catch (error) {
      console.error('Failed to update repository:', error)
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
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
        <div className="flex items-center justify-center min-h-[60vh] overflow-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  if (!repository) {
    return (
      <>
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
        <div className="flex items-center justify-center min-h-[60vh] overflow-auto">
          <p className="text-muted-foreground">Repository not found</p>
        </div>
      </>
    )
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
        <div className="max-w-4xl">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
                Edit Repository
              </h1>
              <p className="text-gray-400 mt-2">
                Update repository settings and configuration
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Repository Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Source Information (Read-only) */}
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Source Configuration</CardTitle>
                <CardDescription className="text-gray-400">
                  These settings cannot be changed after creation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Provider</p>
                    <p className="text-sm text-white capitalize">{repository.source}</p>
                  </div>
                  {repository.source === 'azure' ? (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">Organization</p>
                        <p className="text-sm text-white">{repository.organization}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Project</p>
                        <p className="text-sm text-white">{repository.project}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Repository</p>
                        <p className="text-sm text-white">{repository.repositoryId}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">Owner</p>
                        <p className="text-sm text-white">{repository.owner}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Repository</p>
                        <p className="text-sm text-white">{repository.repo}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Repository Settings */}
            <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
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
                      value={formData.basePath}
                      onChange={(e) => setFormData({ ...formData, basePath: e.target.value })}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-orange"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncSchedule" className="text-gray-300">
                    Sync Schedule
                  </Label>
                  <select
                    id="syncSchedule"
                    value={formData.syncSchedule}
                    onChange={(e) => setFormData({ ...formData, syncSchedule: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-brand-orange focus:outline-none"
                  >
                    <option value="HOURLY_1">Every hour</option>
                    <option value="HOURLY_6">Every 6 hours</option>
                    <option value="HOURLY_12">Every 12 hours</option>
                    <option value="DAILY">Daily at 2am</option>
                    <option value="MANUAL">Manual only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="enabled"
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800/50 text-brand-orange focus:ring-brand-orange"
                  />
                  <Label htmlFor="enabled" className="text-gray-300">
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
                className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Link href={`/admin/repositories/${params.id}`}>
                <Button type="button" variant="ghost" className="text-gray-400 hover:text-white">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  )
}

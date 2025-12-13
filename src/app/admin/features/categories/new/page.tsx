'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CategoryIconUpload } from '@/components/ui/category-icon-upload'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { Toaster } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function NewCategoryPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Box',
    iconBase64: null as string | null,
    color: '#ff6b35',
    order: 0,
    enabled: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/features/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      router.push('/admin/features')
    } catch (error) {
      console.error('Failed to create category:', error)
      setIsSaving(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
    })
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
            { label: 'Features', href: '/admin/features' },
            { label: 'Categories', href: '/admin/features' },
            { label: 'New Category', href: '/admin/features/categories/new' },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">New Application Category</h1>
            <p className="text-gray-400 mt-2">
              Create a new application that users can request features for
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="hover:border-primary hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>General details about the category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Dynamics 365 BC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., dynamics-365-bc"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (auto-generated from name)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the application..."
                rows={3}
              />
            </div>

            <CategoryIconUpload
              onImageChange={(iconBase64) => setFormData({ ...formData, iconBase64 })}
              currentImage={formData.iconBase64}
              disabled={isSaving}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Lucide icon name"
                />
                <p className="text-xs text-muted-foreground">
                  Lucide icon name (e.g., Box, Laptop, Database)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#ff6b35"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                id="enabled"
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="enabled" className="cursor-pointer">
                Enabled (users can request features for this application)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Creating...' : 'Create Category'}
          </Button>

          <Link href="/admin/features">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
      </div>
      <Toaster />
    </>
  )
}

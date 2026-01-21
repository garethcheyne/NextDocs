'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
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

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [category, setCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    iconBase64: null as string | null,
    color: '#ff6b35',
    order: 0,
    enabled: true,
  })

  useEffect(() => {
    fetchCategory()
  }, [resolvedParams.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/features/categories/${resolvedParams.id}`)
      if (!response.ok) throw new Error('Failed to fetch category')

      const data = await response.json()
      setCategory(data.category)
      setFormData({
        name: data.category.name,
        slug: data.category.slug,
        description: data.category.description || '',
        icon: data.category.icon || '',
        iconBase64: data.category.iconBase64 || null,
        color: data.category.color || '#ff6b35',
        order: data.category.order || 0,
        enabled: data.category.enabled,
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch category:', error)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/features/categories/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      router.push('/admin/features')
    } catch (error) {
      console.error('Failed to update category:', error)
      setIsSaving(false)
    }
  }

  const [deleteAction, setDeleteAction] = useState<'orphan' | 'delete'>('orphan')

  const handleDelete = async () => {
    if (category._count.featureRequests > 0) {
      const action = deleteAction === 'delete'
      const message = action
        ? `This will permanently delete ${category._count.featureRequests} feature request(s) along with all their votes and comments. This cannot be undone.`
        : `This will orphan ${category._count.featureRequests} feature request(s). They will remain in the system but won't be associated with any category.`

      if (!confirm(message)) {
        return
      }
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/features/categories/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deleteRequests: deleteAction === 'delete',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete category')
        setIsDeleting(false)
        return
      }

      router.push('/admin/features')
    } catch (error) {
      console.error('Failed to delete category:', error)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  if (!category) {
    return <div className="flex items-center justify-center py-12">Category not found</div>
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
            { label: 'Edit Category', href: `/admin/features/categories/${resolvedParams.id}` },
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">Edit Category</h1>
            <p className="text-gray-400 mt-2">
              {category._count.featureRequests} feature request(s) in this category
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to delete the category &quot;{category.name}&quot;.
                  {category._count.featureRequests > 0 && (
                    <span className="block mt-2 font-semibold text-foreground">
                      This category has {category._count.featureRequests} feature request(s).
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {category._count.featureRequests > 0 && (
                <div className="space-y-3 py-4">
                  <p className="text-sm font-medium">What would you like to do with the feature requests?</p>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                      <Input
                        type="radio"
                        name="deleteAction"
                        value="orphan"
                        checked={deleteAction === 'orphan'}
                        onChange={(e) => setDeleteAction(e.target.value as 'orphan' | 'delete')}
                        className="mt-0.5 w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">Orphan requests</div>
                        <div className="text-sm text-muted-foreground">
                          Keep feature requests but remove category association
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                      <Input
                        type="radio"
                        name="deleteAction"
                        value="delete"
                        checked={deleteAction === 'delete'}
                        onChange={(e) => setDeleteAction(e.target.value as 'orphan' | 'delete')}
                        className="mt-0.5 w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-destructive">Delete all requests</div>
                        <div className="text-sm text-muted-foreground">
                          Permanently delete feature requests, votes, and comments
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Category'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Integration Settings Link */}
        <Card>
          <CardHeader>
            <CardTitle>DevOps Integration</CardTitle>
            <CardDescription>Configure GitHub or Azure DevOps integration for this category</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/admin/features/categories/${resolvedParams.id}/integrations`}>
              <Button variant="outline">
                Configure Integration Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card >
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Enabled
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
              {isSaving ? 'Saving...' : 'Save Changes'}
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


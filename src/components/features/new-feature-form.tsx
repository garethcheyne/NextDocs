'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, Loader2, Plus, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { featureRequestTemplates } from '@/lib/markdown-templates'

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
}

interface NewFeatureFormProps {
    categories: Category[]
}

export function NewFeatureForm({ categories: initialCategories }: NewFeatureFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        tags: [] as string[],
    })

    const [currentTag, setCurrentTag] = useState('')

    const addTag = () => {
        const tag = currentTag.trim().toLowerCase()
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }))
            setCurrentTag('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.title.trim()) {
            setError('Title is required')
            return
        }

        if (!formData.description.trim()) {
            setError('Description is required')
            return
        }

        if (formData.title.length > 200) {
            setError('Title must be 200 characters or less')
            return
        }

        if (formData.description.length > 5000) {
            setError('Description must be 5000 characters or less')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/features', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    categoryId: formData.categoryId || undefined,
                    tags: formData.tags,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to submit feature request')
            }

            const data = await response.json()

            // Redirect to the new feature request
            router.push(`/features/${data.feature.slug}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <Link href="/features">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Features
                    </Button>
                </Link>
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-brand-orange/10">
                        <Lightbulb className="w-8 h-8 text-brand-orange" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Submit Feature Request</h1>
                        <p className="text-muted-foreground">
                            Share your idea to improve our applications
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Details</CardTitle>
                        <CardDescription>
                            Provide clear and detailed information about your feature request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Brief, descriptive title for your feature request"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                disabled={isLoading}
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground">
                                {formData.title.length} / 200 characters
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <MarkdownInput
                                value={formData.description}
                                onChange={(description) => setFormData(prev => ({ ...prev, description }))}
                                label="Description *"
                                placeholder="Describe your feature request in detail. What problem does it solve? How would it work?"
                                disabled={isLoading}
                                rows={10}
                                maxLength={5000}
                                showCharCount={true}
                                templates={featureRequestTemplates}
                                showHelp={true}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Categorize your feature request to help with organization
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tags"
                                    placeholder="Add tags (e.g., ui, performance, integration)"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addTag}
                                    disabled={!currentTag.trim() || isLoading}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                title={`Remove ${tag} tag`}
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-destructive"
                                                disabled={isLoading}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Add relevant tags to make your feature request easier to find (max 10)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end gap-3">
                    <Link href="/features">
                        <Button type="button" variant="outline" disabled={isLoading}>
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Feature Request'
                        )}
                    </Button>
                </div>
            </form>
        </>
    )
}

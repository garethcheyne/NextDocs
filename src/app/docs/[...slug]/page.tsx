import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { Clock, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Badge } from '@/components/ui/badge'

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const session = await auth()
    const resolvedParams = await params

    if (!session) {
        redirect('/')
    }

    // Join slug parts to create the full path
    const fullSlug = resolvedParams.slug.join('/')

    // Find the document by slug (prepend "docs/" to match database format)
    const document = await prisma.document.findFirst({
        where: {
            slug: `docs/${fullSlug}`,
        },
        include: {
            repository: true,
        },
    })

    if (!document) {
        notFound()
    }

    // Fetch category metadata for sidebar
    const categoryMetadata = await prisma.categoryMetadata.findMany({
        orderBy: [
            { level: 'asc' },
            { order: 'asc' },
        ],
    })

    // Build hierarchical category structure
    const buildCategoryTree = () => {
        // Get categories that are children of 'commercial-wiki' (the main doc sections)
        const rootCategories = categoryMetadata
            .filter(cat => cat.parentSlug === 'commercial-wiki')
            .map(cat => {
                // Extract the last part of the slug (e.g., "commercial-wiki/eway" -> "eway")
                const categoryName = cat.categorySlug.split('/').pop() || cat.categorySlug

                return {
                    slug: cat.categorySlug,
                    title: cat.title,
                    icon: cat.icon,
                    description: cat.description,
                    parentSlug: cat.parentSlug,
                    level: cat.level,
                    children: categoryMetadata
                        .filter(child => child.parentSlug === categoryName)
                        .map(child => ({
                            slug: child.categorySlug,
                            title: child.title,
                            icon: child.icon,
                            description: child.description,
                            parentSlug: child.parentSlug,
                            level: child.level,
                        }))
                }
            })

        return rootCategories
    }

    const categoriesWithMeta = buildCategoryTree()

    // Build breadcrumb from slug
    const breadcrumbParts = fullSlug.split('/')
    const allBreadcrumbs = [
        { label: 'Home', href: '/', isLast: false },
        { label: 'Documentation', href: '/docs', isLast: false },
        ...breadcrumbParts.map((part, index) => ({
            label: part.replace(/-/g, ' '),
            href: `/docs/${breadcrumbParts.slice(0, index + 1).join('/')}`,
            isLast: index === breadcrumbParts.length - 1,
        })),
    ]

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath={`/docs/${fullSlug}`}
            breadcrumbs={allBreadcrumbs}
            content={document.content}
            categories={categoriesWithMeta}
        >
                                {/* Document Header */}
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold mb-4">{document.title}</h1>
                                    {document.excerpt && (
                                        <p className="text-xl text-muted-foreground mb-4">{document.excerpt}</p>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        {document.category && (
                                            <Badge variant="secondary" className="capitalize">
                                                {document.category.replace(/-/g, ' ')}
                                            </Badge>
                                        )}
                                        {document.author && (
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>{document.author}</span>
                                            </div>
                                        )}
                                        {document.updatedAt && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Updated {new Date(document.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {document.tags && document.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {document.tags.map((tag) => (
                                                <Badge key={tag} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Document Content */}
                                <div className="prose prose-slate dark:prose-invert max-w-none 
                                    prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-20
                                    prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
                                    prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:pb-2 dark:prose-h2:border-border
                                    prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                                    prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
                                    prose-p:text-sm prose-p:leading-6 prose-p:mb-4 prose-p:text-foreground
                                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                    prose-strong:font-semibold prose-strong:text-foreground
                                    prose-code:text-xs prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                                    prose-pre:bg-muted prose-pre:text-sm prose-pre:text-foreground prose-pre:border prose-pre:rounded-lg prose-pre:p-4 dark:prose-pre:bg-slate-900 dark:prose-pre:border-slate-700
                                    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-sm prose-ul:text-foreground
                                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-sm prose-ol:text-foreground
                                    prose-li:mb-1 prose-li:text-sm prose-li:text-foreground
                                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-sm prose-blockquote:text-muted-foreground
                                    prose-img:rounded-lg prose-img:shadow-md
                                    prose-table:border-collapse prose-table:w-full prose-table:text-sm
                                    prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-th:text-sm prose-th:text-foreground dark:prose-th:bg-slate-800
                                    prose-td:p-2 prose-td:border-t prose-td:text-sm prose-td:text-foreground dark:prose-td:border-slate-700
                                    dark:prose-headings:text-slate-100
                                    dark:prose-p:text-slate-300
                                    dark:prose-li:text-slate-300
                                    dark:prose-strong:text-slate-100
                                    dark:prose-code:bg-slate-800 dark:prose-code:text-slate-100">
                                    <ReactMarkdown>{document.content}</ReactMarkdown>
                                </div>

                                {/* Footer */}
                                <div className="mt-12 pt-8 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Last synced from {document.repository.name} on{' '}
                                        {new Date(document.lastSyncedAt).toLocaleString()}
                                    </p>
                                </div>
        </ContentDetailLayout>
    )
}

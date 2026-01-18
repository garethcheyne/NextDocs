import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { formatDate, formatDateTime } from '@/lib/utils/date-format'
import { prisma } from '@/lib/db/prisma'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { DocumentTracker } from '@/components/document-tracker'
import { Clock, User } from 'lucide-react'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/badges/category-badge'
import { AuthorBadge } from '@/components/badges/author-badge'
import { ContentEngagement } from '@/components/content-engagement'
import { processContentForUser } from '@/lib/content-access'
import { RestrictionBadge, RestrictionSummary } from '@/components/content/restriction-indicators'
import { RestrictedAccess } from '@/components/auth/restricted-access'

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const session = await auth()
    const resolvedParams = await params

    // Join slug parts to create the full path
    const fullSlug = resolvedParams.slug.join('/')

    if (!session) {
        const callbackUrl = `/docs/${fullSlug}`
        redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }

    // Find the document by slug (prepend "docs/" to match database format)
    const document = await prisma.document.findFirst({
        where: {
            slug: `docs/${fullSlug}`,
        },
        select: {
            id: true,
            title: true,
            content: true,
            excerpt: true,
            slug: true,
            category: true,
            tags: true,
            author: true,
            publishedAt: true,
            updatedAt: true,
            repositoryId: true,
            restricted: true,
            restrictedRoles: true,
            repository: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    })

    // If no document found, return 404 (categories are dropdown-only, not pages)
    if (!document) {
        notFound()
    }

    // Process content for role-based access control
    const processedContent = await processContentForUser({
        id: document.id,
        title: document.title,
        content: document.content,
        restricted: document.restricted,
        restrictedRoles: document.restrictedRoles,
    })

    // If user doesn't have access, return 404
    if (!processedContent.hasAccess) {
        notFound()
    }

    // Fetch category metadata for sidebar
    const categoryMetadata = await prisma.categoryMetadata.findMany({
        orderBy: [
            { level: 'asc' },
            { order: 'asc' },
        ],
    })

    // Fetch feature categories to check for matches
    const featureCategories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            iconBase64: true
        }
    })

    // Fetch all index documents to determine which categories have index.md
    const indexDocuments = await prisma.document.findMany({
        where: {
            slug: {
                in: categoryMetadata.map(cat => `docs/${cat.categorySlug}`),
            },
        },
        select: {
            slug: true,
        },
    })

    const indexDocumentSlugs = new Set(indexDocuments.map(doc => doc.slug.replace(/^docs\//, '')))

    // Build hierarchical category structure
    const buildCategoryTree = () => {
        // Recursive function to build children for any category
        const buildChildren = (parentSlug: string): any[] => {
            return categoryMetadata
                .filter(child => child.parentSlug === parentSlug)
                .map(child => ({
                    slug: child.categorySlug,
                    title: child.title,
                    icon: child.icon,
                    description: child.description,
                    parentSlug: child.parentSlug,
                    level: child.level,
                    hasIndexDocument: indexDocumentSlugs.has(child.categorySlug),
                    children: buildChildren(child.categorySlug), // Recursive call
                }))
        }

        // Get root level categories (level 0, no parent OR level 1 with 'docs' parent)
        // This handles both docs/ and docs/docs/ folder structures
        const rootCategories = categoryMetadata
            .filter(cat => 
                (cat.level === 0 && !cat.parentSlug) || 
                (cat.level === 1 && cat.parentSlug === 'docs')
            )
            .map(cat => ({
                slug: cat.categorySlug,
                title: cat.title,
                icon: cat.icon,
                description: cat.description,
                parentSlug: cat.parentSlug,
                level: cat.level,
                hasIndexDocument: indexDocumentSlugs.has(cat.categorySlug),
                children: buildChildren(cat.categorySlug), // Recursive call
            }))

        return rootCategories
    }

    const categoriesWithMeta = buildCategoryTree()

    // Build breadcrumb from slug
    const breadcrumbParts = fullSlug.split('/')
    const allBreadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Documentation', href: '/docs' },
        ...breadcrumbParts.map((part, index) => ({
            label: part.replace(/-/g, ' '),
            href: `/docs/${breadcrumbParts.slice(0, index + 1).join('/')}`,
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
            {/* Document Read Tracking */}
            <DocumentTracker slug={fullSlug} title={document.title} />

            {/* Document Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">{document.title}</h1>
                {document.excerpt && (
                    <p className="text-xl text-muted-foreground mb-4">{document.excerpt}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {document.category && (() => {
                        // Check if document category matches any feature category
                        const matchingFeatureCategory = featureCategories.find(
                            fc => fc.slug === document.category
                        )

                        if (matchingFeatureCategory) {
                            return (
                                <CategoryBadge
                                    category={matchingFeatureCategory}
                                    className="-ml-3"
                                />
                            )
                        }

                        // Fallback to generic badge
                        return (
                            <Badge variant="secondary" className="capitalize">
                                {document.category.replace(/-/g, ' ')}
                            </Badge>
                        )
                    })()}


                    {document.author && <AuthorBadge authorSlug={document.author} />}


                    {document.updatedAt && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Updated {formatDateTime(document.updatedAt)}</span>
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

                {/* Restriction Information for Admins */}
                {processedContent.hasRestrictions && processedContent.restrictionInfo && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <RestrictionSummary
                            isRestricted={processedContent.restrictionInfo.isRestricted}
                            documentRoles={processedContent.restrictionInfo.documentRoles}
                            variants={processedContent.restrictionInfo.restrictedVariants}
                        />
                    </div>
                )}
            </div>

            {/* Engagement Actions */}
            <ContentEngagement
                contentType="document"
                contentId={document.id}
                contentTitle={document.title}
            />

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
                <EnhancedMarkdown>
                    {processedContent.content}
                </EnhancedMarkdown>
            </div>            {/* Footer */}
            <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                    Last updated on{' '}
                    {formatDateTime(document.updatedAt)}
                </p>
            </div>
        </ContentDetailLayout>
    )
}

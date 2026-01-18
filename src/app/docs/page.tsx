import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/layout/section-header'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function DocsPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    // Fetch category metadata
    const categoryMetadata = await prisma.categoryMetadata.findMany({
        orderBy: [
            { level: 'asc' },
            { order: 'asc' },
        ],
    })

    // Fetch feature categories to get their icons
    const featureCategories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        select: {
            slug: true,
            icon: true,
            iconBase64: true,
            color: true,
        },
    })

    // Create a map for quick lookup
    const featureCategoryMap = new Map(
        featureCategories.map(fc => [fc.slug, fc])
    )

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
                    featureCategory: featureCategoryMap.get(child.categorySlug),
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
                featureCategory: featureCategoryMap.get(cat.categorySlug),
                hasIndexDocument: indexDocumentSlugs.has(cat.categorySlug),
                children: buildChildren(cat.categorySlug), // Recursive call
            }))

        return rootCategories
    }

    const categoriesWithMeta = buildCategoryTree()

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/docs"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Documentation', href: '/docs' },
            ]}
            showTOC={false}
            noPadding={true}
        >
            <SectionHeader
                icon={BookOpen}
                title="Documentation"
                subtitle="Access all your organization's documentation in one place. Our platform automatically syncs content from Azure DevOps and GitHub repositories."
            />

            <div className="space-y-6">
                <div className="px-4 sm:px-6 lg:px-12 py-6">
                    {categoriesWithMeta.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        No documentation categories found
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Documentation categories will appear here once repositories are synced
                                    </p>
                                    {session.user?.role?.toLowerCase() === 'admin' && (
                                        <Link href="/admin/repositories">
                                            <Button>
                                                Configure Repositories
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {categoriesWithMeta.map((category) => {
                                const iconColor = category.featureCategory?.color || '#f97316'
                                const hasCustomIcon = category.featureCategory?.iconBase64

                                return (
                                    <Link key={category.slug} href={`/docs/${category.slug}`}>
                                        <Card className="hover:border-brand-orange hover:shadow-xl hover:shadow-brand-orange/20 transition-all duration-500 cursor-pointer group h-full relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
                                            {/* Large decorative icon on the right - half visible */}
                                            {hasCustomIcon ? (
                                                <div 
                                                    className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.08] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500"
                                                    style={{
                                                        filter: `drop-shadow(0 0 20px ${iconColor}40)`,
                                                    }}
                                                >
                                                    <img
                                                        src={category.featureCategory?.iconBase64 || ''}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <BookOpen 
                                                    className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.08] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500"
                                                    style={{ 
                                                        color: iconColor,
                                                        filter: `drop-shadow(0 0 20px ${iconColor}40)`,
                                                    }}
                                                />
                                            )}

                                            {/* Animated gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/0 via-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            
                                            {/* Shimmer effect on hover */}
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                            <CardHeader className="relative z-10">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div
                                                                className="p-1.5 rounded-md group-hover:scale-110 transition-all duration-300"
                                                                style={{
                                                                    backgroundColor: `${iconColor}20`,
                                                                }}
                                                            >
                                                                {hasCustomIcon ? (
                                                                    <img
                                                                        src={category.featureCategory?.iconBase64 || ''}
                                                                        alt={category.title}
                                                                        className="w-4 h-4 object-contain"
                                                                    />
                                                                ) : (
                                                                    <BookOpen
                                                                        className="w-4 h-4"
                                                                        style={{ color: iconColor }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <CardTitle className="group-hover:text-brand-orange transition-colors text-base sm:text-lg font-bold">
                                                                {category.title}
                                                            </CardTitle>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {category.description && (
                                                <CardContent className="relative z-10">
                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {category.description}
                                                    </p>
                                                    {category.children && category.children.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: iconColor }}
                                                                />
                                                                <p className="text-xs font-medium text-muted-foreground">
                                                                    {category.children.length} {category.children.length === 1 ? 'section' : 'sections'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-brand-orange font-medium text-sm group-hover:gap-2 transition-all duration-300">
                                                                <span>Explore</span>
                                                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ContentDetailLayout >
    )
}
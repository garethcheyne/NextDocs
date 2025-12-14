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

        // Get root level categories (level 0, no parent)
        const rootCategories = categoryMetadata
            .filter(cat => cat.level === 0 && !cat.parentSlug)
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
                <div className='px-12 py-6'>
                    {categoriesWithMeta.length === 0 ? (
                        <Card className=\"bg-gray-50/40 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl\">
                            <CardContent className=\"pt-6\">
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoriesWithMeta.map((category) => {
                                return (
                                    <Link key={category.slug} href={`/docs/${category.slug}`}>
                                        <Card className="hover:border-brand-orange hover:shadow-lg hover:shadow-brand-orange/20 transition-all duration-300 cursor-pointer group h-full relative overflow-hidden">
                                            {/* Gradient overlay on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <CardHeader className="relative">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="group-hover:text-brand-orange transition-colors text-lg">
                                                            {category.title}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-brand-orange/10 group-hover:bg-brand-orange/20 group-hover:scale-110 transition-all duration-300">
                                                        <BookOpen className="w-5 h-5 text-brand-orange" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {category.description && (
                                                <CardContent className="relative">
                                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                                        {category.description}
                                                    </p>
                                                    {category.children && category.children.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-muted-foreground">
                                                                    {category.children.length} {category.children.length === 1 ? 'section' : 'sections'}
                                                                </p>
                                                            </div>
                                                            <div className="text-brand-orange group-hover:translate-x-1 transition-transform duration-300">
                                                                →
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
        </ContentDetailLayout>
    )
}
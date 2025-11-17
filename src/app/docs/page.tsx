import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { BookOpen, PanelLeft, ChevronRight } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

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

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar user={session.user} currentPath="/docs" categories={categoriesWithMeta} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center justify-between w-full gap-2 px-4">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-1">
                                    <PanelLeft />
                                    <span className="sr-only">Toggle Sidebar</span>
                                </SidebarTrigger>
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                <BreadcrumbNavigation items={[
                                    { label: 'Home', href: '/', isLast: false },
                                    { label: 'Documentation', href: '/docs', isLast: true },
                                ]} />
                            </div>
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 px-12 py-6 overflow-auto">
                        <div className="max-w-7xl space-y-6">
                            {/* Welcome Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Welcome to Wiki
                                    </CardTitle>
                                    <CardDescription>
                                        Your centralized enterprise documentation platform
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-muted-foreground">
                                    <p>
                                        Access all your organization's documentation in one place. Our platform automatically syncs content from Azure DevOps and GitHub repositories, providing version-controlled, searchable documentation for your enterprise applications.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Documentation Categories */}
                            <div>
                                <h2 className="text-xl font-bold mb-4">Documentation Categories</h2>

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
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categoriesWithMeta.map((category) => {
                                            // Remove "commercial-wiki/" prefix from slug for links
                                            const linkSlug = category.slug.replace('commercial-wiki/', '')
                                            
                                            return (
                                                <Link key={category.slug} href={`/docs/${linkSlug}`}>
                                                    <Card className="hover:border-primary transition-all cursor-pointer group h-full">
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <CardTitle className="group-hover:text-primary transition-colors">
                                                                        {category.title}
                                                                    </CardTitle>
                                                                </div>
                                                                <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </div>
                                                        </CardHeader>
                                                        {category.description && (
                                                            <CardContent>
                                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                                    {category.description}
                                                                </p>
                                                                {category.children && category.children.length > 0 && (
                                                                    <div className="mt-3 pt-3 border-t">
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {category.children.length} {category.children.length === 1 ? 'section' : 'sections'}
                                                                        </p>
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
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/lib/db/prisma'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { FeaturesClient } from '@/components/features/features-client'

export default async function FeaturesPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; status?: string; sort?: string }>
}) {
    const session = await auth()
    const params = await searchParams

    if (!session) {
        redirect('/')
    }

    // Build query filters
    const where: any = {}
    if (params.category) {
        where.categoryId = params.category
    }
    if (params.status) {
        where.status = params.status
    }

    // Build sort order
    let orderBy: any = { lastActivityAt: 'desc' }
    if (params.sort === 'votes') {
        orderBy = { voteCount: 'desc' }
    } else if (params.sort === 'newest') {
        orderBy = { createdAt: 'desc' }
    } else if (params.sort === 'oldest') {
        orderBy = { createdAt: 'asc' }
    }

    // Fetch all feature requests
    const features = await prisma.featureRequest.findMany({
        where,
        include: {
            category: {
                select: {
                    name: true,
                    slug: true,
                    icon: true,
                    color: true,
                },
            },
            creator: {
                select: {
                    name: true,
                    email: true,
                },
            },
            votes: session?.user?.id ? {
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                    voteType: true,
                },
            } : false,
        },
        orderBy,
    })

    // Fetch all categories for filter
    const categories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
    })

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar 
                    user={session.user} 
                    currentPath="/features"
                    featureCategories={categories}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <BreadcrumbNavigation
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Feature Requests', href: '/features' },
                            ]}
                        />
                        <div className="ml-auto flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto">
                        <FeaturesClient 
                            features={features}
                            categories={categories}
                            params={params}
                        />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}


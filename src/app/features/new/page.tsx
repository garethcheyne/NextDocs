import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/lib/db/prisma'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { NewFeatureForm } from '@/components/features/new-feature-form'

export default async function NewFeatureRequestPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    // Fetch categories for the form
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
                                { label: 'New Request', href: '/features/new' },
                            ]}
                        />
                        <div className="ml-auto flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto px-12 py-6">
                        <NewFeatureForm categories={categories} />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

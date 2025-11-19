import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { TableOfContents } from '@/components/layout/table-of-contents'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation, type BreadcrumbItemType } from '@/components/breadcrumb-navigation'
import { PanelLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface Category {
    slug: string
    title: string
    icon?: string | null
    description?: string | null
    parentSlug?: string | null
    level: number
    hasIndexDocument?: boolean  // True if category has an index.md
    children?: Category[]
}

interface BlogCategory {
    category: string
    count: number
}

interface ApiSpec {
    slug: string
    name: string
    category: string | null
    version: string
}

interface ContentDetailLayoutProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
    currentPath: string
    breadcrumbs: BreadcrumbItemType[]
    content: string
    children: ReactNode
    categories?: Category[]
    blogCategories?: BlogCategory[]
    apiSpecs?: ApiSpec[]
}

export function ContentDetailLayout({
    user,
    currentPath,
    breadcrumbs,
    content,
    children,
    categories,
    blogCategories,
    apiSpecs,
}: ContentDetailLayoutProps) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen max-h-screen w-full overflow-hidden">
                <AppSidebar 
                    user={user} 
                    currentPath={currentPath} 
                    categories={categories}
                    blogCategories={blogCategories}
                    apiSpecs={apiSpecs}
                />

                {/* Main Page */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Header/Breadcrumb */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center justify-between w-full gap-2 px-4">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-1">
                                    <PanelLeft />
                                    <span className="sr-only">Toggle Sidebar</span>
                                </SidebarTrigger>
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                <BreadcrumbNavigation items={breadcrumbs} />
                            </div>
                            <ThemeToggle />
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex flex-1 overflow-hidden">

                        {/* Content */}
                        <main className="flex-1 overflow-y-auto px-12 py-6">
                            <article className="max-w-5xl ml-8">
                                {children}
                            </article>
                        </main>

                        {/* Table of Contents */}
                        <aside className="hidden xl:flex w-64 border-l flex-shrink-0">
                            <TableOfContents content={content} />
                        </aside>
                    </div>

                </div>
            </div>
        </SidebarProvider>
    )
}

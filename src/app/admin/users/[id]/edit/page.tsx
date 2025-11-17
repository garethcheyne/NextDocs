import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import EditUserForm from '@/components/admin/edit-user-form'
import { PanelLeft, ChevronRight } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const resolvedParams = await params

    if (!session || session.user.role !== 'admin') {
        redirect('/')
    }

    const user = await prisma.user.findUnique({
        where: {
            id: resolvedParams.id,
        },
    })

    if (!user) {
        notFound()
    }

    return (
        <>
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center justify-between w-full gap-2 px-4">
                    <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1">
                        <PanelLeft />
                        <span className="sr-only">Toggle Sidebar</span>
                    </SidebarTrigger>
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/">
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block">
                                <ChevronRight />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin">
                                    Admin
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block">
                                <ChevronRight />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin/users">
                                    Users
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block">
                                <ChevronRight />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Edit User</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 px-12 py-6 overflow-auto">
                <div className="max-w-4xl space-y-6">
                    <EditUserForm user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image,
                        provider: user.provider,
                        createdAt: user.createdAt.toISOString(),
                    }} />
                </div>
            </main>
        </>
    )
}

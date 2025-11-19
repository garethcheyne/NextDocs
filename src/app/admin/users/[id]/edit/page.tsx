import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import EditUserForm from '@/components/admin/edit-user-form'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

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
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <BreadcrumbNavigation
                    items={[
                        { label: 'Admin', href: '/admin' },
                        { label: 'Users', href: '/admin/users' },
                        { label: 'Edit User', href: `/admin/users/${resolvedParams.id}/edit` },
                    ]}
                />
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-2xl">
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
            </div>
        </>
    )
}

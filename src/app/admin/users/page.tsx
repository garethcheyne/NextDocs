import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { UsersTable } from './users-table'
import { Toaster } from 'sonner'

export default async function UsersPage() {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
        redirect('/')
    }

    const users = await prisma.user.findMany({
        orderBy: [
            { createdAt: 'desc' },
        ],
        select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            provider: true,
            active: true,
            image: true,
            createdAt: true,
            _count: {
                select: {
                    repositories: true,
                },
            },
        },
    })

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
                    ]}
                />
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">User Management</h1>
                        <p className="text-gray-400 mt-2">
                            Manage user accounts and permissions
                        </p>
                    </div>
                </div>

                <UsersTable users={users} currentUserId={session.user.id} />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>Showing {users.length} user{users.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <Toaster />
        </>
    )
}

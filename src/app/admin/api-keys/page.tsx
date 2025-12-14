import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { APIKeyManagement } from '@/components/admin/api-key-management'
import { Toaster } from '@/components/ui/sonner'

export default async function APIKeysPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    if (session.user.role !== 'admin') {
        redirect('/features')
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
                        { label: 'API Keys', href: '/admin/api-keys' },
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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">API Key Management</h1>
                        <p className="text-gray-400 mt-2">
                            Create and manage API keys for programmatic access
                        </p>
                    </div>
                </div>

                <APIKeyManagement userId={session.user.id} />
            </div>
            <Toaster />
        </>
    )
}
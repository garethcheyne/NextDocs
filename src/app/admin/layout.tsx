import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  if (session.user?.role?.toLowerCase() !== 'admin') {
    redirect('/docs')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen max-h-screen w-full overflow-hidden">
        <AppSidebar user={session.user} currentPath="/admin" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}

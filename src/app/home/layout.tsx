import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DynamicAdminSidebar } from '@/components/layout/dynamic-admin-sidebar'

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login?callbackUrl=/home')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen max-h-screen w-full overflow-hidden">
        <DynamicAdminSidebar user={session.user} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}

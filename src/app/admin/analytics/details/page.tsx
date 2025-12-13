import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { AnalyticsDetailsTable } from '@/components/admin/analytics/details-table'

export default async function AnalyticsDetailsPage() {
  const session = await auth()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/docs')
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Analytics', href: '/admin/analytics' },
            { label: 'Details', href: '/admin/analytics/details' }
          ]}
        />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">Analytics Details</h1>
            <p className="text-gray-400 mt-2">Detailed view of all analytics events</p>
          </div>
          
          <AnalyticsDetailsTable />
        </div>
      </div>
    </div>
  )
}

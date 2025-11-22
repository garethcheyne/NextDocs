import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AnalyticsDashboard } from '@/components/admin/analytics/dashboard'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { Button } from '@/components/ui/button'
import { Table2 } from 'lucide-react'

export const metadata = {
  title: 'Analytics Dashboard | Admin',
  description: 'View site analytics and user activity'
}

export default async function AnalyticsPage() {
  const session = await auth()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/docs')
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
            { label: 'Analytics', href: '/admin/analytics' },
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Track user activity, content performance, and site engagement
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/analytics/details">
              <Table2 className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
        <AnalyticsDashboard />
      </div>
    </>
  )
}

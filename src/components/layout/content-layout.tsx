import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'

interface BreadcrumbItem {
  label: string
  href: string
}

interface ContentLayoutProps {
  breadcrumbs: BreadcrumbItem[]
  children: React.ReactNode
}

export function ContentLayout({ breadcrumbs, children }: ContentLayoutProps) {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation items={breadcrumbs} />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </>
  )
}

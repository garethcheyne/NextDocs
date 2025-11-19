import { PanelLeft } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation, type BreadcrumbItemType } from '@/components/breadcrumb-navigation'

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItemType[]
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center justify-between w-full gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1">
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <BreadcrumbNavigation items={breadcrumbs} />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

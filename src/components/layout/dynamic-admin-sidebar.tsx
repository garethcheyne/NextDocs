'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'

interface DynamicAdminSidebarProps {
  user: any
}

export function DynamicAdminSidebar({ user }: DynamicAdminSidebarProps) {
  const pathname = usePathname()
  
  return <AppSidebar user={user} currentPath={pathname} />
}
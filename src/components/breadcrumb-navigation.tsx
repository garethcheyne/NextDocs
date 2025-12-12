import React from 'react'
import { ChevronRight } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SearchTrigger } from '@/components/search/search-trigger'
import { ViewersIndicator } from '@/components/viewers/viewers-indicator'

export interface BreadcrumbItemType {
    label: string
    href: string
}

interface BreadcrumbNavigationProps {
    items: BreadcrumbItemType[]
    showSearch?: boolean
    showViewers?: boolean
}

export function BreadcrumbNavigation({ items, showSearch = true, showViewers = true }: BreadcrumbNavigationProps) {
    const currentPageUrl = items[items.length - 1]?.href || ''
    
    return (
        <div className="flex items-center gap-4 w-full">
            <Breadcrumb className="flex-shrink-0">
                <BreadcrumbList>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1
                        return (
                        <React.Fragment key={item.href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={item.href}>
                                        {item.label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {index < items.length - 1 && (
                                <BreadcrumbSeparator>
                                    <ChevronRight />
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    )})}
                </BreadcrumbList>
            </Breadcrumb>
            
            {showViewers && currentPageUrl && (
                <ViewersIndicator 
                    pageUrl={currentPageUrl}
                    className="flex-shrink-0"
                />
            )}
            
            <div className="flex-1" />
            {showSearch && (
                <div className="w-full max-w-md flex-shrink-0">
                    <SearchTrigger />
                </div>
            )}
        </div>
    )
}

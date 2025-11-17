import { ChevronRight } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export interface BreadcrumbItemType {
    label: string
    href: string
    isLast: boolean
}

interface BreadcrumbNavigationProps {
    items: BreadcrumbItemType[]
}

export function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <BreadcrumbItem key={item.href}>
                        {item.isLast ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                            <>
                                <BreadcrumbLink href={item.href}>
                                    {item.label}
                                </BreadcrumbLink>
                                {index < items.length - 1 && (
                                    <BreadcrumbSeparator>
                                        <ChevronRight />
                                    </BreadcrumbSeparator>
                                )}
                            </>
                        )}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

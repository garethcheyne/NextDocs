import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from 'lucide-react'

interface PriorityBadgeProps {
    priority: string | null
    className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    if (!priority) return null

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'critical':
                return {
                    styles: 'bg-red-600 text-white border-red-600',
                    icon: AlertTriangle
                }
            case 'high':
                return {
                    styles: 'bg-orange-600 text-white border-orange-600',
                    icon: ArrowUp
                }
            case 'medium':
                return {
                    styles: 'bg-yellow-600 text-white border-yellow-600',
                    icon: Minus
                }
            case 'low':
                return {
                    styles: 'bg-green-600 text-white border-green-600',
                    icon: ArrowDown
                }
            default:
                return {
                    styles: 'bg-gray-700 text-white border-gray-700',
                    icon: Minus
                }
        }
    }

    const config = getPriorityConfig(priority)
    const Icon = config.icon

    return (
        <Badge
            variant="outline"
            className={cn(
                'px-2 py-0.5 text-xs font-medium capitalize transition-colors flex items-center gap-1',
                config.styles,
                className
            )}
        >
            <Icon className="w-3 h-3" />
            {priority}
        </Badge>
    )
}
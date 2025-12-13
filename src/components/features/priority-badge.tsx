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
                    styles: 'bg-red-500 text-white border-red-500 hover:bg-red-600',
                    icon: AlertTriangle
                }
            case 'high':
                return {
                    styles: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
                    icon: ArrowUp
                }
            case 'medium':
                return {
                    styles: 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600',
                    icon: Minus
                }
            case 'low':
                return {
                    styles: 'bg-green-500 text-white border-green-500 hover:bg-green-600',
                    icon: ArrowDown
                }
            default:
                return {
                    styles: 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600',
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
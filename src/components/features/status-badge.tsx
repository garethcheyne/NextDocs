import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle, Play, Check, X } from 'lucide-react'

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'proposal':
                return {
                    styles: 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600',
                    icon: Clock
                }
            case 'approved':
                return {
                    styles: 'bg-green-500 text-white border-green-500 hover:bg-green-600',
                    icon: CheckCircle
                }
            case 'in-progress':
                return {
                    styles: 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
                    icon: Play
                }
            case 'completed':
                return {
                    styles: 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
                    icon: Check
                }
            case 'declined':
                return {
                    styles: 'bg-red-500 text-white border-red-500 hover:bg-red-600',
                    icon: X
                }
            default:
                return {
                    styles: 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600',
                    icon: Clock
                }
        }
    }

    const config = getStatusConfig(status)
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
            {status.replace('-', ' ')}
        </Badge>
    )
}
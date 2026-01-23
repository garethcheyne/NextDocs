import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle, Play, Check, X, AlertCircle } from 'lucide-react'
import { getStatusColors } from '@/lib/status-colors'

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        const colors = getStatusColors(status)
        
        switch (status) {
            case 'proposal':
                return {
                    styles: `${colors.bg} ${colors.text} ${colors.border}`,
                    icon: Clock
                }
            case 'approved':
                return {
                    styles: `${colors.bg} ${colors.text} ${colors.border}`,
                    icon: CheckCircle
                }
            case 'in-progress':
                return {
                    styles: `${colors.bg} ${colors.text} ${colors.border}`,
                    icon: Play
                }
            case 'completed':
                return {
                    styles: `${colors.bg} ${colors.text} ${colors.border}`,
                    icon: Check
                }
            case 'declined':
                return {
                    styles: `${colors.bg} ${colors.text} ${colors.border}`,
                    icon: X
                }
            case 'on-hold':
                return {
                    styles: `${colors.bg} ${colors.text} ${colors.border}`,
                    icon: AlertCircle
                }
            default:
                return {
                    styles: 'bg-gray-500 text-white border-gray-500',
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
                'h-6 px-2 text-xs font-medium capitalize transition-colors flex items-center gap-1',
                config.styles,
                className
            )}
        >
            <Icon className="w-3 h-3" />
            {status.replace('-', ' ')}
        </Badge>
    )
}

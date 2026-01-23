import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Hash } from 'lucide-react'

interface FeatureSlugBadgeProps {
    slug: string
    className?: string
}

export function FeatureSlugBadge({ slug, className }: FeatureSlugBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'h-6 px-3 text-xs font-mono font-semibold bg-brand-orange/10 text-brand-orange border-brand-orange/20 flex items-center gap-1',
                className
            )}
        >
            <Hash className="w-3 h-3" />
            {slug}
        </Badge>
    )
}

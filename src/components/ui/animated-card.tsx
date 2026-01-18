import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
    children: ReactNode
    className?: string
    isAnimated?: boolean
    decorativeIcon?: ReactNode
    iconColor?: string
    showShimmer?: boolean
    showGradientOverlay?: boolean
    onClick?: () => void
}

export function AnimatedCard({
    children,
    className,
    isAnimated = false,
    decorativeIcon,
    iconColor = '#f97316',
    showShimmer = true,
    showGradientOverlay = true,
    onClick,
}: AnimatedCardProps) {
    if (!isAnimated) {
        return (
            <Card className={className} onClick={onClick}>
                {children}
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                'hover:border-brand-orange hover:shadow-xl hover:shadow-brand-orange/20 transition-all duration-500 cursor-pointer group relative overflow-hidden bg-gradient-to-br from-background to-muted/20',
                className
            )}
            onClick={onClick}
        >
            {/* Large decorative icon on the right - half visible */}
            {decorativeIcon && (
                <div
                    className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.08] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500"
                    style={{
                        color: iconColor,
                        filter: `drop-shadow(0 0 20px ${iconColor}40)`,
                    }}
                >
                    {decorativeIcon}
                </div>
            )}

            {/* Animated gradient overlay */}
            {showGradientOverlay && (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/0 via-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            {/* Shimmer effect on hover */}
            {showShimmer && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            {/* Content with z-index to stay above effects */}
            <div className="relative z-10">
                {children}
            </div>
        </Card>
    )
}

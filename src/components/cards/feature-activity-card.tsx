import Link from 'next/link'
import { ThumbsUp, MessageSquare, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCard } from '@/components/ui/animated-card'
import { StatusBadge } from '@/components/badges/status-badge'
import { CategoryBadge } from '@/components/badges/category-badge'
import { defaultStatusColors, getStatusHoverClass } from '@/lib/status-colors'

interface Category {
    id: string
    name: string
    slug: string
    color: string | null
    iconBase64?: string | null
}

interface FeatureActivityCardProps {
    feature: {
        id: string
        title: string
        slug: string
        status: string
        description?: string
        priority?: string | null
        involvement?: string
        category: Category | null
        lastActivityAt?: string | Date
        _count: {
            votes: number
            comments: number
        }
    }
    statusColors?: Record<string, string>
    isExtended?: boolean
    isAnimated?: boolean
}

export function FeatureActivityCard({ feature, statusColors = defaultStatusColors, isExtended = false, isAnimated = false }: FeatureActivityCardProps) {
    const CardWrapper = isAnimated ? AnimatedCard : Card
    const hoverClass = getStatusHoverClass(feature.status)

    if (isExtended) {
        return (
            <Link href={`/features/${feature.slug}`}>
                <CardWrapper 
                    className={`${hoverClass} transition-colors cursor-pointer`}
                    isAnimated={isAnimated}
                    decorativeIcon={<Activity className="w-32 h-32" />}
                    iconColor="#a855f7"
                >
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                                    {feature.involvement && (
                                        <Badge variant="outline" className="text-xs">
                                            {feature.involvement === 'created' ? 'You created' :
                                                feature.involvement === 'following' ? 'Following' : 'Voted'}
                                        </Badge>
                                    )}
                                </div>
                                {feature.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                        {feature.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusBadge status={feature.status} />
                                    {feature.priority && (
                                        <Badge variant="outline" className="text-xs">
                                            {feature.priority}
                                        </Badge>
                                    )}
                                    {feature.category && (
                                        <CategoryBadge category={feature.category} />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4" />
                                    {feature._count.votes}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    {feature._count.comments}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </CardWrapper>
            </Link>
        )
    }

    return (
        <Link href={`/features/${feature.slug}`}>
            <CardWrapper 
                className={`${hoverClass} transition-colors cursor-pointer`}
                isAnimated={isAnimated}
                decorativeIcon={<Activity className="w-32 h-32" />}
                iconColor="#a855f7"
            >
                <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium line-clamp-1">{feature.title}</h4>
                                {feature.involvement && (
                                    <Badge variant="outline" className="text-xs">
                                        {feature.involvement === 'created' ? 'You created' :
                                            feature.involvement === 'following' ? 'Following' : 'Voted'}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={feature.status} />
                                {feature.category && (
                                    <CategoryBadge category={feature.category} />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {feature._count.votes}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {feature._count.comments}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </CardWrapper>
        </Link>
    )
}

import Link from 'next/link'
import { ThumbsUp, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
}

const defaultStatusColors: Record<string, string> = {
    proposal: 'bg-yellow-500',
    approved: 'bg-purple-500',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    declined: 'bg-red-500',
    'on-hold': 'bg-orange-500',
}

export function FeatureActivityCard({ feature, statusColors = defaultStatusColors, isExtended = false }: FeatureActivityCardProps) {
    if (isExtended) {
        return (
            <Link href={`/features/${feature.slug}`}>
                <Card className="hover:border-purple-500/50 transition-colors cursor-pointer">
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
                                    <Badge className={`${statusColors[feature.status] || 'bg-gray-500'} text-white text-xs`}>
                                        {feature.status}
                                    </Badge>
                                    {feature.priority && (
                                        <Badge variant="outline" className="text-xs">
                                            {feature.priority}
                                        </Badge>
                                    )}
                                    {feature.category && (
                                        <span
                                            className="text-xs"
                                            style={feature.category.color ? { color: feature.category.color } : undefined}
                                        >
                                            {feature.category.name}
                                        </span>
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
                </Card>
            </Link>
        )
    }

    return (
        <Link href={`/features/${feature.slug}`}>
            <Card className="hover:border-purple-500/50 transition-colors cursor-pointer">
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
                                <Badge className={`${statusColors[feature.status] || 'bg-gray-500'} text-white text-xs`}>
                                    {feature.status}
                                </Badge>
                                {feature.category && (
                                    <span
                                        className="text-xs"
                                        style={feature.category.color ? { color: feature.category.color } : undefined}
                                    >
                                        {feature.category.name}
                                    </span>
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
            </Card>
        </Link>
    )
}

import Link from 'next/link'
import { Calendar, Users, Megaphone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/badges/category-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCard } from '@/components/ui/animated-card'
import { EnhancedMarkdown } from '@/components/markdown/enhanced-markdown'

interface Category {
    id: string
    name: string
    slug: string
    color: string | null
    iconBase64?: string | null
}

interface Team {
    id: string
    name: string
    slug: string
    color: string | null
}

interface ReleaseCardProps {
    release: {
        id: string
        version: string
        title: string | null
        content: string
        publishedAt: string | Date
        category: Category | null
        teams?: Team[]
    }
    href?: string
    isNew?: boolean
    isExtended?: boolean
    isAnimated?: boolean
}

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function ReleaseCard({ release, href = '/releases', isNew = false, isExtended = false, isAnimated = false }: ReleaseCardProps) {
    const CardWrapper = isAnimated ? AnimatedCard : Card
    const releaseHref = `/releases#${release.version}`

    if (isExtended) {
        return (
            <Link href={releaseHref} id={release.version}>
                <CardWrapper 
                    className="hover:border-primary/50 transition-colors cursor-pointer"
                    isAnimated={isAnimated}
                    decorativeIcon={<Megaphone className="w-32 h-32" />}
                    iconColor="#22c55e"
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="font-mono text-green-500 border-green-500/50">
                                v{release.version}
                            </Badge>
                            {release.title && (
                                <span className="font-semibold text-lg">{release.title}</span>
                            )}
                            {isNew && (
                                <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
                            )}
                        </div>
                        
                        <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                            <EnhancedMarkdown>{release.content}</EnhancedMarkdown>
                        </div>
                        
                        <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground pt-3 border-t">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(release.publishedAt)}
                            </span>
                            {release.category && (
                                <CategoryBadge category={release.category} />
                            )}
                            {release.teams && release.teams.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {release.teams.length} team{release.teams.length !== 1 ? 's' : ''}:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {release.teams.map((team) => (
                                            <Badge
                                                key={team.id}
                                                variant="outline"
                                                className="text-xs"
                                                style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                                            >
                                                {team.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </CardWrapper>
            </Link>
        )
    }

    return (
        <Link href={href}>
            <CardWrapper 
                className="hover:border-green-500/50 transition-colors cursor-pointer"
                isAnimated={isAnimated}
                decorativeIcon={<Megaphone className="w-32 h-32" />}
                iconColor="#22c55e"
            >
                <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-green-500 border-green-500/50">
                            v{release.version}
                        </Badge>
                        {release.title && (
                            <span className="text-sm font-medium">{release.title}</span>
                        )}
                        {isNew && (
                            <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {release.content.slice(0, 150)}{release.content.length > 150 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {release.category && (
                            <CategoryBadge category={release.category} />
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(release.publishedAt)}
                        </span>
                    </div>
                </CardContent>
            </CardWrapper>
        </Link>
    )
}

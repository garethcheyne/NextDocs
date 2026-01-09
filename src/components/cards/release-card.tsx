import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/features/category-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedMarkdown } from '@/components/ui/enhanced-markdown'

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
}

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function ReleaseCard({ release, href = '/releases', isNew = false, isExtended = false }: ReleaseCardProps) {
    if (isExtended) {
        return (
            <Card className="hover:border-green-500/50 transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-lg px-3 py-1 text-green-500 border-green-500/50">
                            v{release.version}
                        </Badge>
                        {release.title && (
                            <CardTitle className="text-xl">{release.title}</CardTitle>
                        )}
                        {isNew && (
                            <Badge className="bg-green-500 text-white">NEW</Badge>
                        )}
                    </div>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(release.publishedAt)}
                        </span>
                        {release.category && (
                            <CategoryBadge category={release.category} />
                        )}
                        {release.teams && release.teams.length > 0 && (
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {release.teams.length} team{release.teams.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <EnhancedMarkdown>{release.content}</EnhancedMarkdown>
                    {release.teams && release.teams.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex flex-wrap gap-2">
                                {release.teams.map((team) => (
                                    <Badge
                                        key={team.id}
                                        variant="outline"
                                        style={team.color ? { borderColor: team.color, color: team.color } : undefined}
                                    >
                                        {team.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Link href={href}>
            <Card className="hover:border-green-500/50 transition-colors cursor-pointer">
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
            </Card>
        </Link>
    )
}

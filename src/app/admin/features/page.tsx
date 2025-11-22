import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lightbulb, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db/prisma'

export default async function AdminFeaturesPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    if (session.user?.role?.toLowerCase() !== 'admin') {
        redirect('/features')
    }

    // Fetch feature statistics
    const [
        totalFeatures,
        categories,
        statusCounts,
    ] = await Promise.all([
        prisma.featureRequest.count(),
        prisma.featureCategory.findMany({
            include: {
                _count: {
                    select: { featureRequests: true },
                },
            },
            orderBy: { order: 'asc' },
        }),
        prisma.featureRequest.groupBy({
            by: ['status'],
            _count: true,
        }),
    ])

    const stats = {
        total: totalFeatures,
        proposal: statusCounts.find(s => s.status === 'proposal')?._count || 0,
        approved: statusCounts.find(s => s.status === 'approved')?._count || 0,
        inProgress: statusCounts.find(s => s.status === 'in-progress')?._count || 0,
        completed: statusCounts.find(s => s.status === 'completed')?._count || 0,
        declined: statusCounts.find(s => s.status === 'declined')?._count || 0,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
                        Feature Request Management
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage feature requests and application categories
                    </p>
                </div>
                <Link href="/admin/features/categories/new">
                    <Button className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Category
                    </Button>
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-400" />
                            <CardTitle className="text-xs font-medium text-blue-400">Total Requests</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <CardTitle className="text-xs font-medium text-yellow-400">Pending Approval</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.proposal}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                            <CardTitle className="text-xs font-medium text-purple-400">In Progress</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-colors">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-green-400" />
                            <CardTitle className="text-xs font-medium text-green-400">Completed</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Application Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Categories</CardTitle>
                    <CardDescription>
                        Manage applications that users can request features for
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-orange/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="font-semibold">{category.name}</h3>
                                        {category.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{category._count.featureRequests}</div>
                                        <div className="text-xs text-muted-foreground">requests</div>
                                    </div>

                                    {!category.enabled && (
                                        <Badge variant="secondary">Disabled</Badge>
                                    )}

                                    <Link href={`/admin/features/categories/${category.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {categories.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No categories configured yet.</p>
                                <p className="text-sm mt-2">Create your first application category to get started.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

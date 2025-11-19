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
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Lightbulb className="w-8 h-8 text-brand-orange" />
                        Feature Requests Admin
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage feature requests and application categories
                    </p>
                </div>
                <Link href="/admin/features/categories/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Category
                    </Button>
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-500">{stats.proposal}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
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

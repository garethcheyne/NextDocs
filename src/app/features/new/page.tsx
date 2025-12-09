import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { NewFeatureForm } from '@/components/features/new-feature-form'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function NewFeatureRequestPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    // Fetch categories for the form
    const categories = await prisma.featureCategory.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
    })

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/features"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Feature Requests', href: '/features' },
                { label: 'New Request', href: '/features/new' },
            ]}
            showTOC={false}
        >
            <NewFeatureForm categories={categories} />
        </ContentDetailLayout>
    )
}

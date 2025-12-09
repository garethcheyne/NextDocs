import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { FluentUIIconGrid } from '@/components/guide/fluentui-icon-grid'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function FluentUIIconsPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    return (
        <ContentDetailLayout
            user={session.user}
            currentPath="/guide/icons/fluentui"
            breadcrumbs={[
                { label: 'Content Creator Guide', href: '/guide' },
                { label: 'Icon Libraries', href: '/guide/icons' },
                { label: 'FluentUI Icons', href: '/guide/icons/fluentui' },
            ]}
            showTOC={false}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <Link href="/guide/icons">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Icon Libraries
                    </Button>
                </Link>

                <div>
                    <h1 className="text-3xl font-bold mb-2">FluentUI Icons</h1>
                    <p className="text-muted-foreground">
                        Browse Microsoft&apos;s FluentUI icon library. Click any icon to copy its syntax.
                    </p>
                </div>

                <FluentUIIconGrid />
            </div>
        </ContentDetailLayout>
    )
}

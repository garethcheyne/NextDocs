import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { FluentUIIconGrid } from '@/components/guide/fluentui-icon-grid'
import { ContentLayout } from '@/components/layout/content-layout'

export default async function FluentUIIconsPage() {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    return (
        <ContentLayout
            breadcrumbs={[
                { label: 'Content Creator Guide', href: '/guide' },
                { label: 'Icon Libraries', href: '/guide/icons' },
                { label: 'FluentUI Icons', href: '/guide/icons/fluentui' },
            ]}
        >
            <div className="max-w-7xl mx-auto px-4 py-6">
                <Link href="/guide/icons">
                    <Button variant="outline" size="sm" className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Icon Libraries
                    </Button>
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">FluentUI Icons</h1>
                    <p className="text-muted-foreground">
                        Browse Microsoft&apos;s FluentUI icon library. Click any icon to copy its syntax.
                    </p>
                </div>

                <FluentUIIconGrid />
            </div>
        </ContentLayout>
    )
}

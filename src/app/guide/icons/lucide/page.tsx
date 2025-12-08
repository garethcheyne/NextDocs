import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LucideIconGrid } from '@/components/guide/lucide-icon-grid'
import { ContentLayout } from '@/components/layout/content-layout'

export default async function LucideIconsPage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return (
    <ContentLayout
      breadcrumbs={[
        { label: 'Content Creator Guide', href: '/guide' },
        { label: 'Icon Libraries', href: '/guide/icons' },
        { label: 'Lucide Icons', href: '/guide/icons/lucide' },
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
          <h1 className="text-3xl font-bold mb-2">Lucide Icons</h1>
          <p className="text-muted-foreground">
            Browse 1,000+ clean, consistent icons. Click any icon to copy its syntax.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-muted/50 border space-y-2">
          <h3 className="font-semibold">Usage:</h3>
          <div className="text-sm space-y-1">
            <p>
              <strong>In Markdown:</strong> <code className="px-2 py-1 bg-background rounded">:icon-name:</code> (kebab-case)
            </p>
            <p>
              <strong>In _meta.json:</strong> <code className="px-2 py-1 bg-background rounded">&quot;IconName&quot;</code> (PascalCase)
            </p>
          </div>
        </div>

        <LucideIconGrid />
      </div>
    </ContentLayout>
  )
}

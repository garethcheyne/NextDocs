import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import IntegrationSettings from '@/components/admin/integration-settings';
import { auth } from '@/lib/auth/auth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation';
import { Toaster } from 'sonner';

export default async function CategoryIntegrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return notFound();
  }

  const { id } = await params;

  const category = await prisma.featureCategory.findUnique({
    where: { id },
  });

  if (!category) {
    return notFound();
  }

  // Check which integrations are enabled
  const devopsEnabled = process.env.DEVOPS_ENABLED === 'true';
  const githubEnabled = process.env.GITHUB_ENABLED === 'true';

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Features', href: '/admin/features' },
            { label: 'Categories', href: '/admin/features' },
            { label: category.name, href: `/admin/features/categories/${id}` },
            { label: 'Integrations', href: `/admin/features/categories/${id}/integrations` },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">Integration Settings</h1>
            <p className="text-gray-400 mt-2">
              Configure DevOps integration for {category.name}
            </p>
          </div>
        </div>

        <IntegrationSettings
          key={category.id}
          category={category}
          devopsEnabled={devopsEnabled}
          githubEnabled={githubEnabled}
        />
      </div>
      <Toaster />
    </>
  );
}

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import IntegrationSettings from '@/components/admin/integration-settings';
import { auth } from '@/lib/auth/auth';

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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Integration Settings</h1>
        <p className="text-muted-foreground">
          Configure DevOps integration for {category.name}
        </p>
      </div>

      <IntegrationSettings key={category.id} category={category} />
    </div>
  );
}

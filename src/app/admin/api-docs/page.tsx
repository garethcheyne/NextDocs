import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { APIDocs } from '@/components/admin/api-docs'

export const metadata = {
  title: 'API Documentation - Admin',
  description: 'API documentation for NextDocs administrators'
}

export default async function ApiDocsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user?.role !== 'admin') {
    redirect('/features')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">
            Comprehensive API documentation and interactive explorer for administrators
          </p>
        </div>
      </div>

      <APIDocs isAdmin={true} />
    </div>
  )
}
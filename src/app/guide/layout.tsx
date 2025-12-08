import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  // Check if user is editor or admin
  const userRole = session.user?.role?.toLowerCase()
  if (userRole !== 'editor' && userRole !== 'admin') {
    redirect('/docs')
  }

  return <>{children}</>
}

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { PreferencesContent } from '@/components/profile/preferences-content'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export const metadata: Metadata = {
  title: 'Profile | NextDocs',
  description: 'Manage your account profile, activity, and notification settings',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get full user details from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      provider: true,
      createdAt: true,
      emailNotifications: true,
      notifyOnFeatureStatusChange: true,
      notifyOnFeatureComment: true,
      notifyOnNewFeature: true,
      notifyOnFeatureVote: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <ContentDetailLayout
      user={session?.user ?? { name: null, email: null, role: null }}
      currentPath="/profile"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Profile', href: '/profile' },
      ]}
      showTOC={false}
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your account information, activity, and notification settings
        </p>
      </div>

      <PreferencesContent user={user} />
    </ContentDetailLayout>
  )
}
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { PreferencesContent } from '@/components/preferences/preferences-content'

export const metadata: Metadata = {
  title: 'Preferences | NextDocs',
  description: 'Manage your account preferences and notification settings',
}

export default async function PreferencesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account information, activity, and notification settings
        </p>
      </div>

      <PreferencesContent user={session.user} />
    </div>
  )
}
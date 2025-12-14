'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileTab } from './tabs/profile-tab'
import { ActivityTab } from './tabs/activity-tab'
import { NotificationsTab } from './tabs/notifications-tab'
import { PrivacyTab } from './tabs/privacy-tab'
import { User, Settings, Activity, Shield, Bell } from 'lucide-react'

interface PreferencesContentProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role?: string | null
    image?: string | null
  }
}

export function PreferencesContent({ user }: PreferencesContentProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityTab userId={user.id} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsTab userId={user.id} />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacyTab userId={user.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
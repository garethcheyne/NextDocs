import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import PasswordChangeForm from '@/components/profile/password-change-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User as UserIcon, Shield, Mail, Calendar, Key } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
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
    redirect('/login')
  }

  const isLocalUser = user.provider === 'credentials'

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Profile', href: '/profile' }
          ]}
          showSearch={false}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* User Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your NextDocs account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-20 h-20 rounded-full ring-2 ring-offset-2 ring-brand-orange/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center ring-2 ring-offset-2 ring-brand-orange/20">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{user.name || 'Unknown'}</h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Account Details Grid */}
              <div className="grid gap-4 pt-4 border-t sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Authentication
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {user.provider === 'credentials' ? 'Local Account' : user.provider || 'SSO'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </p>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Section - Only for Local Users */}
          {isLocalUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure. Use a strong password with at least 8 characters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>
          )}

          {/* SSO User Notice */}
          {!isLocalUser && (
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Your account uses {user.provider === 'azuread' ? 'Azure AD' : 'SSO'} authentication. 
                    Password management is handled by your organization&apos;s identity provider.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Manage your email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">All Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Master toggle for all email notifications
                    </p>
                  </div>
                  <Badge variant={user.emailNotifications ? 'default' : 'secondary'}>
                    {user.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                
                {user.emailNotifications && (
                  <>
                    <Separator />
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Feature status changes</p>
                        <Badge variant={user.notifyOnFeatureStatusChange ? 'outline' : 'secondary'} className="text-xs">
                          {user.notifyOnFeatureStatusChange ? 'On' : 'Off'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Feature comments</p>
                        <Badge variant={user.notifyOnFeatureComment ? 'outline' : 'secondary'} className="text-xs">
                          {user.notifyOnFeatureComment ? 'On' : 'Off'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">New feature submissions</p>
                        <Badge variant={user.notifyOnNewFeature ? 'outline' : 'secondary'} className="text-xs">
                          {user.notifyOnNewFeature ? 'On' : 'Off'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Feature votes</p>
                        <Badge variant={user.notifyOnFeatureVote ? 'outline' : 'secondary'} className="text-xs">
                          {user.notifyOnFeatureVote ? 'On' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

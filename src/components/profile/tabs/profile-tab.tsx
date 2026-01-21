'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/date-format'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Shield, Calendar } from 'lucide-react'

interface ProfileTabProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role?: string | null
    image?: string | null
    provider?: string | null
    createdAt?: Date | null
  }
}

export function ProfileTab({ user }: ProfileTabProps) {

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your basic account information and details we have on file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback className="text-lg">
                {user.name?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{user.name || 'No name set'}</h3>
                {user.role && (
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Display Name</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.name || 'Not set'}
                </span>
                <span className="text-xs text-gray-500">Managed by Active Directory</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                <span className="text-xs text-gray-500">Managed by Azure AD</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Account Role</Label>
              <div className="flex items-center justify-between">
                <Badge className={getRoleBadgeColor(user.role || 'user')}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role || 'user'}
                </Badge>
                <span className="text-xs text-gray-500">Assigned by administrator</span>
              </div>
            </div>

            {user.createdAt && (
              <div className="grid gap-2">
                <Label>Member Since</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="user-id">User ID</Label>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {user.id}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>
            Summary of your account activity and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Features Created</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Features Liked</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Comments Made</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
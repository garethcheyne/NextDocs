'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/features/status-badge'
import { PriorityBadge } from '@/components/features/priority-badge'
// ScrollArea component not available, using regular div
import { Heart, MessageSquare, Plus, Eye, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ActivityTabProps {
  userId: string
}

interface FeatureRequest {
  id: string
  title: string
  slug: string
  status: string
  priority: string
  createdAt: string
  likesCount: number
  commentsCount: number
  category?: {
    name: string
  }
}

interface UserActivity {
  createdFeatures: FeatureRequest[]
  likedFeatures: FeatureRequest[]
  followedFeatures: FeatureRequest[]
  recentComments: any[]
}

export function ActivityTab({ userId }: ActivityTabProps) {
  const [activity, setActivity] = useState<UserActivity>({
    createdFeatures: [],
    likedFeatures: [],
    followedFeatures: [],
    recentComments: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/user/activity`)
        if (response.ok) {
          const data = await response.json()
          setActivity(data)
        }
      } catch (error) {
        console.error('Error fetching user activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [userId])





  const FeatureCard = ({ feature }: { feature: FeatureRequest }) => (
    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <Link 
          href={`/features/${feature.slug}`}
          className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
        >
          {feature.title}
          <ExternalLink className="h-3 w-3" />
        </Link>
        <div className="flex gap-1">
          <StatusBadge status={feature.status} />
          <PriorityBadge priority={feature.priority} />
        </div>
      </div>
      
      {feature.category && (
        <Badge variant="outline" className="mb-2">
          {feature.category.name}
        </Badge>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {feature.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {feature.commentsCount}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(feature.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>
            Track your engagement and contributions to the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="created" className="flex items-center gap-1">
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Created ({activity.createdFeatures.length})</span>
                <span className="sm:hidden">{activity.createdFeatures.length}</span>
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span className="hidden sm:inline">Liked ({activity.likedFeatures.length})</span>
                <span className="sm:hidden">{activity.likedFeatures.length}</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Following ({activity.followedFeatures.length})</span>
                <span className="sm:hidden">{activity.followedFeatures.length}</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Comments ({activity.recentComments.length})</span>
                <span className="sm:hidden">{activity.recentComments.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Feature Requests You Created</h3>
                  <Link href="/features/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Create New
                    </Button>
                  </Link>
                </div>
                <div className="h-[400px] overflow-y-auto">
                  <div className="space-y-3">
                    {activity.createdFeatures.length > 0 ? (
                      activity.createdFeatures.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>You haven't created any feature requests yet.</p>
                        <Link href="/features/new">
                          <Button className="mt-2" size="sm">
                            Create Your First Feature Request
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="liked" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Feature Requests You Liked</h3>
                <div className="h-[400px] overflow-y-auto">
                  <div className="space-y-3">
                    {activity.likedFeatures.length > 0 ? (
                      activity.likedFeatures.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>You haven't liked any feature requests yet.</p>
                        <Link href="/features">
                          <Button className="mt-2" size="sm">
                            Browse Feature Requests
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="followed" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Feature Requests You Follow</h3>
                <div className="h-[400px] overflow-y-auto">
                  <div className="space-y-3">
                    {activity.followedFeatures.length > 0 ? (
                      activity.followedFeatures.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>You're not following any feature requests yet.</p>
                        <Link href="/features">
                          <Button className="mt-2" size="sm">
                            Find Features to Follow
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Recent Comments</h3>
                <div className="h-[400px] overflow-y-auto">
                  <div className="space-y-3">
                    {activity.recentComments.length > 0 ? (
                      activity.recentComments.map((comment, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <p className="text-sm">{comment.content}</p>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            on <Link href={`/features/${comment.feature.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                              {comment.feature.title}
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>You haven't made any comments yet.</p>
                        <Link href="/features">
                          <Button className="mt-2" size="sm">
                            Join the Discussion
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}